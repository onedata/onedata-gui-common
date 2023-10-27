/**
 * Modifies lane charts dashboard.
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
  i18nPrefix: 'components.workflowVisualiser.lane.actions.modifyLaneChartsDashboard',

  /**
   * @override
   */
  className: 'modify-lane-charts-dashboard-action-trigger',

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

    await this.modalManager.show('workflow-visualiser/charts-modal', {
      mode: 'edit',
      dashboardOwnerType: 'lane',
      dashboardOwner: this.lane,
      onSubmit: () =>
        result.interceptPromise(this.modifyLaneChartsDashboard()),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },

  async modifyLaneChartsDashboard() {
    return this.lane.chartsDashboardEditorModelContainer.propagateChange();
  },
});
