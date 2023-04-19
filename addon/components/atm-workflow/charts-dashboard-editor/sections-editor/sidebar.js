import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/sidebar';

export default Component.extend({
  layout,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | Utils.AtmWorkflow.ChartsDashboardEditor.Section | null}
   */
  selectedElement: null,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActionsFactory}
   */
  actionsFactory: undefined,
});
