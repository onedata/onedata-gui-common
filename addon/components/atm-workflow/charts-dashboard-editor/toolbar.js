/**
 * Toolbar for dashboard editor. Contains actions global for the whole editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/toolbar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['toolbar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.toolbar',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.UndoManager}
   */
  undoManager: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart | null}
   */
  editedChart: null,

  /**
   * @virtual
   * @type {() => void}
   */
  onRemoveDashboard: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * @type {boolean}
   */
  isRemoveDashboardConfirmationOpened: false,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  title: computed('editedChart.title', function title() {
    if (this.editedChart) {
      return this.editedChart.title ?
        this.t('chartEditor', { chartTitle: this.editedChart.title }) :
        this.t('chartEditorUnnamed');
    } else {
      return this.t('dashboardOverview');
    }
  }),

  actions: {
    /**
     * @returns {void}
     */
    back() {
      const action = this.actionsFactory.createEndChartContentEditionAction();
      action.execute();
    },

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
