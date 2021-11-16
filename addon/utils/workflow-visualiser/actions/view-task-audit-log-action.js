/**
 * Shows task audit log. Needs `task` and `getAuditLogContentCallback` passed via context.
 *
 * @module utils/workflow-visualiser/actions/view-task-audit-log-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.Task>}
   */
  task: reads('context.task'),

  /**
   * @param {Utils.WorkflowVisualiser.Store} store
   * @type {ComputedProperty<Function>}
   */
  getAuditLogContentCallback: reads('context.getAuditLogContentCallback'),

  /**
   * @override
   */
  onExecute() {
    const {
      task,
      getAuditLogContentCallback,
      modalManager,
    } = this.getProperties(
      'task',
      'getAuditLogContentCallback',
      'modalManager'
    );
    const systemAuditLogStore = get(task, 'systemAuditLogStore');

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        viewModeLayout: 'auditLog',
        auditLogSubjectName: `"${get(task, 'name')}"`,
        store: systemAuditLogStore,
        getStoreContentCallback: (...args) =>
          getAuditLogContentCallback(systemAuditLogStore, ...args),
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
