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
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/sections-editor/floating-toolbar';
import { ElementType } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['floating-toolbar'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.atmWorkflow.chartsDashboardEditor.sectionsEditor.floatingToolbar',

  /**
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Section}
   */
  model: undefined,

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.ActionsFactory}
   */
  actionsFactory: undefined,

  /**
   * @type {ComputedProperty<Array<{ name: string, icon: string }>>}
   */
  actionsToRender: computed('model.elementType', function actionsToRender() {
    const actions = [{
      name: 'duplicate',
      icon: 'browser-copy',
    }, {
      name: 'remove',
      icon: 'browser-delete',
    }];

    if (this.model?.elementType === ElementType.Chart) {
      actions.unshift({
        name: 'editContent',
        icon: 'rename',
      });
    }

    return actions;
  }),

  actions: {
    /**
     * @returns {void}
     */
    editContent() {
      const action = this.actionsFactory.createEditChartContentAction({
        chart: this.model,
      });
      action.execute();
    },

    /**
     * @returns {void}
     */
    duplicate() {
      const action = this.actionsFactory.createDuplicateElementAction({
        elementToDuplicate: this.model,
      });
      action.execute();
    },

    /**
     * @returns {void}
     */
    remove() {
      const action = this.actionsFactory.createRemoveElementAction({
        elementToRemove: this.model,
      });
      action.execute();
    },
  },
});
