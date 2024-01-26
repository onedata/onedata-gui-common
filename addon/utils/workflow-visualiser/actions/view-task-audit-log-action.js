/**
 * Shows task audit log. Needs `task` and `getAuditLogContentCallback` passed via context.
 * Optionally `runNumber` can be passed to point to another (non-default) run.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { not } from 'ember-awesome-macros';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.task.actions.viewTaskAuditLog',

  /**
   * @override
   */
  className: 'view-task-audit-log-action-trigger',

  /**
   * @override
   */
  disabled: not('task.systemAuditLogStore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.Task>}
   */
  task: reads('context.task'),

  /**
   * @type {ComputedProperty<number>}
   */
  runNumber: reads('context.runNumber'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.ActionsFactory>}
   */
  actionsFactory: reads('context.actionsFactory'),

  /**
   * @param {Utils.WorkflowVisualiser.Store} store
   * @type {ComputedProperty<Function>}
   */
  getAuditLogContentCallback: reads('context.getAuditLogContentCallback'),

  /**
   * @type {ComputedProperty<(taskInstanceId: string) => { task: Utils.WorkflowVisualiser.Lane.Task, runNumber: number } | null>}
   */
  getTaskRunForInstanceIdCallback: reads('context.getTaskRunForInstanceIdCallback'),

  /**
   * @override
   */
  onExecute() {
    const {
      task,
      runNumber,
      getAuditLogContentCallback,
      modalManager,
    } = this.getProperties(
      'task',
      'runNumber',
      'getAuditLogContentCallback',
      'modalManager'
    );

    let systemAuditLogStore = task.systemAuditLogStore;
    let taskExecutionId = task.instanceId;
    if (runNumber !== undefined) {
      const run = task.runsRegistry?.[runNumber];
      if (run?.instanceId) {
        taskExecutionId = run.instanceId;
      }
      if (run?.systemAuditLogStore) {
        systemAuditLogStore = run.systemAuditLogStore;
      }
    }

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        store: systemAuditLogStore,
        taskExecutionId,
        actionsFactory: this.actionsFactory,
        getStoreContentCallback: (...args) =>
          getAuditLogContentCallback(systemAuditLogStore, ...args),
        getTaskRunForInstanceIdCallback: this.getTaskRunForInstanceIdCallback,
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
