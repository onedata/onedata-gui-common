/**
 * Shows workflow audit log.
 *
 * @module utils/workflow-visualiser/actions/view-workflow-audit-log-action
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
   * @type {ComputedProperty<Function>}
   */
  getAuditLogContentCallback: reads('context.getAuditLogContentCallback'),

  /**
   * @override
   */
  onExecute() {
    const {
      workflow,
      getAuditLogContentCallback,
      modalManager,
    } = this.getProperties(
      'workflow',
      'getAuditLogContentCallback',
      'modalManager'
    );
    const systemAuditLogStore = get(workflow, 'systemAuditLogStore');

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        viewModeLayout: 'auditLog',
        auditLogSubjectName: this.t('auditLogSubjectName'),
        store: systemAuditLogStore,
        getStoreContentCallback: (...args) => getAuditLogContentCallback(...args),
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
