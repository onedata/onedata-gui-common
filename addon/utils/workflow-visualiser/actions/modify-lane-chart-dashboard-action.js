/**
 * Modifies lane chart dashboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.modifyLaneChartDashboard',

  /**
   * @override
   */
  className: 'modify-lane-chart-dashboard-action-trigger',

  /**
   * @override
   */
  icon: 'overview',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();

    await this.modalManager.show('workflow-visualiser/chart-dashboard-editor-modal', {
      mode: 'edit',
      dashboardOwner: this.lane,
      onSubmit: () =>
        result.interceptPromise(this.modifyLaneChartDashboard()),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },

  async modifyLaneChartDashboard() {
    return this.lane.chartDashboardEditorModelContainer.propagateChange();
  },
});
