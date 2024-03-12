/**
 * Is a special container, which aim is to provide consistent chart dashboard access
 * API for different models containing that dashboard.
 *
 * Exposes a ready to use `dashboardModel` created from spec and data sources
 * injected by owning model (task, store, etc).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import {
  createModelFromSpec,
  useNewSpecInModel,
} from './chart-dashboard-editor';

/**
 * @typedef {EmberObject} DashboardModelOwner
 * @property {ChartDashboardEditorModelContainer} chartDashboardEditorModelContainer
 */

export default EmberObject.extend({
  /**
   * @virtual
   * @type {EmberObject<{ chartDashboardEditorDataSources: Array<ChartDashboardEditorDataSource> }>}
   */
  relatedElement: undefined,

  /**
   * @virtual
   * @type {ComputedProperty<AtmTimeSeriesDashboardSpec>}
   */
  dashboardSpec: undefined,

  /**
   * Should apply changed dashboard spec (save it, mark model as modified etc.)
   * @virtual
   * @type {(newDashboardSpec: AtmTimeSeriesDashboardSpec) => Promise<void>}
   */
  onPropagateChange: undefined,

  /**
   * Will be calculated and updated by `dashboardModelUpdater`
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.Model}
   */
  dashboardModel: undefined,

  /**
   * @type {ComputedProperty<Array<ChartDashboardEditorDataSource>>}
   */
  dataSources: reads('relatedElement.chartDashboardEditorDataSources'),

  dashboardModelUpdater: observer(
    'relatedElement',
    'dashboardSpec',
    'dataSources',
    function dashboardModelUpdater() {
      if (!this.dashboardModel) {
        this.set('dashboardModel', createModelFromSpec(
          this.dashboardSpec ?? null,
          this.relatedElement,
          this.dataSources
        ));
        return;
      }

      if (!_.isEqual(this.dashboardModel.toJson(), this.dashboardSpec)) {
        useNewSpecInModel(this.dashboardSpec, this.dashboardModel);
      }
      if (this.dataSources !== this.dashboardModel.dataSources) {
        set(this.dashboardModel, 'dataSources', this.dataSources ?? []);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.dashboardModelUpdater();
  },

  async propagateChange() {
    await this.onPropagateChange?.(this.dashboardModel.toJson());
  },
});
