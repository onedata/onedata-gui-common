import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor';
import ActionsFactory from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/sections-editor-actions/actions-factory';
import UndoManager from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/undo-manager';

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

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.UndoManager}
   */
  undoManager: undefined,

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    const actionsFactory = new ActionsFactory(this);
    const undoManager = UndoManager.create();
    actionsFactory.addExecuteListener((action) =>
      undoManager.addActionToHistory(action)
    );

    this.setProperties({
      actionsFactory,
      undoManager,
    });
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.actionsFactory.destroy();
      this.undoManager.destroy();
    } finally {
      this._super(...arguments);
    }
  },
});
