import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-editor/series-group-editor';

export default Component.extend({
  classNames: ['series-group-editor', 'element-editor'],
  layout,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SeriesGroup}
   */
  chartElement: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,
});
