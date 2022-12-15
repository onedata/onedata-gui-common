/**
 * Modifies workflow charts dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.workflow.actions.modifyWorkflowChartsDashboard',

  /**
   * @override
   */
  className: 'modify-workflow-charts-dashboard-action-trigger',

  /**
   * @override
   */
  icon: 'overview',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: reads('context.workflow'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    await this.modalManager.show('workflow-visualiser/charts-modal', {
      mode: 'edit',
      dashboardOwnerType: 'workflow',
      dashboardSpec: this.workflow.dashboardSpec,
      onSubmit: newDashboardSpec =>
        result.interceptPromise(this.modifyWorkflowChartsDashboard(newDashboardSpec)),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },

  async modifyWorkflowChartsDashboard(newDashboardSpec) {
    return this.workflow.modify({ dashboardSpec: newDashboardSpec });
  },
});
