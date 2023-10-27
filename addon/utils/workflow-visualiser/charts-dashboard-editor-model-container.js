import EmberObject, { observer, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import _ from 'lodash';
import {
  createModelFromSpec,
  useNewSpecInModel,
} from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {EmberObject}
   */
  relatedElement: undefined,

  /**
   * @virtual
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  dashboardSpec: undefined,

  /**
   * @virtual
   * @type {(newDashboardSpec: AtmTimeSeriesDashboardSpec) => void}
   */
  onPropagateChange: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Model}
   */
  dashboardModel: undefined,

  /**
   * @type {ComputedProperty<Array<ChartsDashboardEditorDataSource>>}
   */
  dataSources: reads('relatedElement.chartsDashboardEditorDataSources'),

  dashboardModelUpdater: observer(
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

  propagateChange() {
    this.onPropagateChange?.(this.dashboardModel.toJson());
  },
});
