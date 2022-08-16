/**
 * Shows store details. Needs store and (optionally) storeContentPresenterContext
 * passed via context.
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
   * @type {ComputedProperty<AtmValuePresenterContext | undefined>}
   */
  storeContentPresenterContext: reads('context.storeContentPresenterContext'),

  /**
   * @override
   */
  onExecute() {
    const {
      store,
      getStoreContentCallback,
      modalManager,
      storeContentPresenterContext,
    } = this.getProperties(
      'store',
      'getStoreContentCallback',
      'modalManager',
      'storeContentPresenterContext'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        store,
        getStoreContentCallback: (...args) => getStoreContentCallback(store, ...args),
        storeContentPresenterContext,
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
