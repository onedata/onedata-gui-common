/**
 * Shows store details. Needs store passed via context.
 *
 * @module utils/workflow-visualiser/actions/view-store-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  store: reads('context.store'),

  /**
   * @type {ComputedProperty<Function>}
   */
  getStoreContentCallback: reads('context.getStoreContentCallback'),

  /**
   * @override
   */
  onExecute() {
    const {
      store,
      getStoreContentCallback,
      modalManager,
    } = this.getProperties(
      'store',
      'getStoreContentCallback',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        store,
        getStoreContentCallback,
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
