/**
 * Modifies workflow chart dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { inject as service } from '@ember/service';
import { or } from 'ember-awesome-macros';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.workflow.actions.modifyWorkflowChartDashboard',

  /**
   * @override
   */
  className: 'modify-workflow-chart-dashboard-action-trigger',

  /**
   * @override
   */
  icon: 'overview',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: or('context.workflow.content', 'context.workflow'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    await this.modalManager.show('workflow-visualiser/chart-dashboard-editor-modal', {
      mode: 'edit',
      dashboardOwner: this.workflow,
      onSubmit: () => result.interceptPromise(this.modifyWorkflowChartDashboard()),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },

  async modifyWorkflowChartDashboard() {
    return this.workflow.chartDashboardEditorModelContainer.propagateChange();
  },
});
