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
  onExecute() {
    set(this.newSubsection, 'parentSection', this.targetSection);
    set(this.targetSection, 'sections', [
      ...this.targetSection.sections,
      this.newSubsection,
    ]);
  },
});
