import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor';
import ActionsFactory from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/sections-editor-actions/actions-factory';

export default Component.extend({
  layout,
  classNames: ['sections-editor'],

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  rootSection: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onRemoveDashboard: undefined,

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.SectionsEditorActions.ActionsFactory}
   */
  actionsFactory: undefined,

  init() {
    this._super(...arguments);
    this.set('actionsFactory', new ActionsFactory(this));
  },
});
