/**
 * Represents the whole workflow.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import EmberObject from '@ember/object';
import ChartDashboardEditorModelContainer from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor-model-container';

export default EmberObject.extend({
  /**
   * @type {String}
   */
  __modelType: 'workflow',

  /**
   * @virtual optional
   * @type {String}
   */
  instanceId: undefined,

  /**
   * @virtual optional
   * @type {string | undefined}
   */
  name: undefined,

  /**
   * @virtual optional
   * @type {Utils.WorkflowVisualiser.Store}
   */
  systemAuditLogStore: undefined,

  /**
   * @virtual optional
   * @type {AtmTimeSeriesDashboardSpec | null}
   */
  dashboardSpec: null,

  /**
   * @virtual optional
   * @type {String}
   */
  status: undefined,

  /**
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.Store>}
   */
  stores: undefined,

  /**
   * @virtual optional
   * @type {Array<Utils.WorkflowVisualiser.Lane>}
   */
  lanes: undefined,

  /**
   * @type {string}
   */
  icon: 'atm-workflow',

  /**
   * @type {ComputedProperty<Array<ChartDashboardEditorDataSource>>}
   */
  chartDashboardEditorDataSources: computed(
    'stores.@each.chartDashboardEditorDataSources',
    'lanes.@each.chartDashboardEditorDataSources',
    function chartDashboardEditorDataSources() {
      return _.flatten([
        ...(this.stores?.map((store) =>
          store.chartDashboardEditorDataSources ?? []
        ) ?? []),
        ...(this.lanes?.map((lane) =>
          lane.chartDashboardEditorDataSources ?? []
        ) ?? []),
      ]).map((dataSource) => ({ ...dataSource, isDefault: false }));
    }
  ),

  /**
   * @type {ComputedPropertyChartDashboardEditorModelContainer>}
   */
  chartDashboardEditorModelContainer: computed(
    function chartDashboardEditorModelContainer() {
      return ChartDashboardEditorModelContainer.extend({
        dashboardSpec: reads('relatedElement.dashboardSpec'),
      }).create({
        relatedElement: this,
        onPropagateChange: (newDashboardSpec) => this.modify({
          dashboardSpec: newDashboardSpec,
        }),
      });
    }
  ),

  /**
   * @virtual optional
   * @type {Function}
   * @param {Utils.WorkflowVisualiser.Workflow} workflow
   * @param {Object} modifiedProps
   * @returns {Promise}
   */
  onModify: undefined,

  async modify(modifiedProps) {
    return this.onModify?.(this, modifiedProps);
  },
});
