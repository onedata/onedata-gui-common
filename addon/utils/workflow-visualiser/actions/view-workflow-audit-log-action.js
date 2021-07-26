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
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

const auditLogDummyStore = {
  type: 'auditLog',
  dataSpec: {
    type: 'object',
    valueConstraints: {},
  },
};

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
   * @type {ComputedProperty<Function>}
   */
  getAuditLogContentCallback: reads('context.getAuditLogContentCallback'),

  /**
   * @override
   */
  onExecute() {
    const {
      getAuditLogContentCallback,
      modalManager,
    } = this.getProperties(
      'getAuditLogContentCallback',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        viewModeLayout: 'auditLog',
        auditLogSubjectName: this.t('auditLogSubjectName'),
        store: auditLogDummyStore,
        getStoreContentCallback: (...args) => getAuditLogContentCallback(...args),
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
