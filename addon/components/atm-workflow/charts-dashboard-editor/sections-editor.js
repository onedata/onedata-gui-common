import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor';

export default Component.extend({
  layout,
  classNames: ['sections-editor'],

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardSpec.Section}
   */
  rootSection: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onRemoveDashboard: undefined,
});
