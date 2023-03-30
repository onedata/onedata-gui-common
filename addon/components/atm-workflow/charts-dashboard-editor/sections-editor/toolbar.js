import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/toolbar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['toolbar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.toolbar',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.UndoManager}
   */
  undoManager: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onRemoveDashboard: undefined,

  /**
   * @type {boolean}
   */
  isRemoveDashboardConfirmationOpened: false,

  actions: {
    /**
     * @returns {void}
     */
    undo() {
      this.undoManager.undo();
    },

    /**
     * @returns {void}
     */
    redo() {
      this.undoManager.redo();
    },

    /**
     * @returns {void}
     */
    removeDashboard() {
      this.set('isRemoveDashboardConfirmationOpened', false);
      this.onRemoveDashboard?.();
    },
  },
});
