/**
 * Shows workflow audit log.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.store.actions.viewWorkflowAuditLog',

  /**
   * @override
   */
  icon: 'view-list',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Workflow>}
   */
  workflow: reads('context.workflow'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.ActionsFactory>}
   */
  actionsFactory: reads('context.actionsFactory'),

  /**
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
      workflow,
      getAuditLogContentCallback,
      getTaskRunForInstanceIdCallback,
      actionsFactory,
      modalManager,
    } = this.getProperties(
      'workflow',
      'getAuditLogContentCallback',
      'getTaskRunForInstanceIdCallback',
      'actionsFactory',
      'modalManager'
    );
    const systemAuditLogStore = get(workflow, 'systemAuditLogStore');

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        viewModeLayout: 'auditLog',
        subjectName: this.t('subjectName'),
        store: systemAuditLogStore,
        getStoreContentCallback: (...args) => getAuditLogContentCallback(...args),
        getTaskRunForInstanceIdCallback,
        actionsFactory,
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
