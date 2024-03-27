/**
 * Floating toolbar for editor elements (sections and charts). Rendered actions
 * depends on type of the passed model.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/atm-workflow/chart-dashboard-editor/sections-editor/floating-toolbar';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/chart-dashboard-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['floating-toolbar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartDashboardEditor.sectionsEditor.floatingToolbar',

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.DashboardElement}
   */
  model: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartDashboardEditor.EditorContext}
   */
  editorContext: undefined,

  /**
   * @type {ComputedProperty<Array<{ name: string, icon: string }>>}
   */
  actionsToRender: computed(
    'model.elementType',
    'editorContext.isReadOnly',
    function actionsToRender() {
      const actions = [];
      if (!this.editorContext.isReadOnly) {
        actions.push({
          name: 'duplicate',
          icon: 'browser-copy',
        }, {
          name: 'remove',
          icon: 'browser-delete',
        });
      }

      if (this.model?.elementType === ElementType.Chart) {
        actions.unshift({
          name: this.editorContext.isReadOnly ? 'viewContent' : 'editContent',
          icon: this.editorContext.isReadOnly ? 'view' : 'browser-rename',
        });
      }

      return actions;
    }
  ),

  showChartEditor() {
    const action = this.editorContext.actionsFactory.createEditChartContentAction({
      chart: this.model,
    });
    action.execute();
  },

  actions: {
    /**
     * @returns {void}
     */
    viewContent() {
      this.showChartEditor();
    },

    /**
     * @returns {void}
     */
    editContent() {
      this.showChartEditor();
    },

    /**
     * @returns {void}
     */
    duplicate() {
      const action = this.editorContext.actionsFactory.createDuplicateElementAction({
        elementToDuplicate: this.model,
      });
      action.execute();
    },

    /**
     * @returns {void}
     */
    remove() {
      const action = this.editorContext.actionsFactory.createRemoveElementAction({
        elementToRemove: this.model,
      });
      action.execute();
    },
  },
});
