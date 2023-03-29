import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/section';

export default Component.extend({
  layout,
  classNames: ['section', 'one-time-series-charts-section'],
  classNameBindings: ['section.isRoot:root-section'],

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardSpec.Section}
   */
  section: undefined,
});
