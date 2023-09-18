/**
 * Removes store. Needs store instance passed via context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2023 ACK CYFRONET AGH
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
  i18nPrefix: 'components.workflowVisualiser.store.actions.removeStore',

  /**
   * @override
   */
  className: 'remove-store-action-trigger',

  /**
   * @override
   */
  icon: 'browser-delete',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  store: reads('context.store'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    await this.modalManager.show('workflow-visualiser/remove-store-modal', {
      store: this.store,
      onSubmit: () =>
        result.interceptPromise(this.store.remove()),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },
});
