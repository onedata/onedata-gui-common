/**
 * Adds new subsection to specific section.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { set, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { createNewSection } from 'onedata-gui-common/utils/atm-workflow/charts-dashboard-editor/create-model';

/**
 * @typedef {Object} AddSubsectionActionContext
 * @property {Utils.AtmWorkflow.ChartsDashboardEditor.Section} targetSection
 */

export default Action.extend({
  i18n: service(),

  /**
   * @virtual
   * @type {AddSubsectionActionContext}
   */
  context: undefined,

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Section>}
   */
  targetSection: reads('context.targetSection'),

  /**
   * @type {ComputedProperty<Utils.AtmWorkflow.ChartsDashboardEditor.Section>}
   */
  newSubsection: computed(function newSubsection() {
    return createNewSection(this.i18n);
  }),

  /**
   * @override
   */
  willDestroy() {
    try {
      const newSubsection = this.cacheFor('newSubsection');
      if (newSubsection && !newSubsection.parentSection) {
        newSubsection.destroy();
      }
      this.set('context', null);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  onExecute() {
    set(this.newSubsection, 'parentSection', this.targetSection);
    set(this.targetSection, 'sections', [
      ...this.targetSection.sections,
      this.newSubsection,
    ]);
  },

  /**
   * @override
   */
  onExecuteUndo() {
    set(
      this.targetSection,
      'sections',
      this.targetSection.sections.filter((section) => section !== this.newSubsection)
    );
    set(this.newSubsection, 'parentSection', null);
  },
});
