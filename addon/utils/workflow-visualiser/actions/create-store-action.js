/**
 * Creates new store. Needs createStoreCallback passed via context. It will then be used
 * to save a new store.
 *
 * @module utils/workflow-visualiser/actions/create-store-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
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
  i18nPrefix: 'components.workflowVisualiser.store.actions.createStore',

  /**
   * @override
   */
  className: 'create-store-action-trigger',

  /**
   * @override
   */
  icon: 'plus',

  /**
   * @type {ComputedProperty<Function>}
   * @param {Object} newStoreProps
   * @returns {Promise}
   */
  createStoreCallback: reads('context.createStoreCallback'),

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    return this.get('modalManager')
      .show('workflow-visualiser/store-modal', {
        mode: 'create',
        onSubmit: storeProvidedByForm =>
          result.interceptPromise(this.createStore(storeProvidedByForm)),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  createStore(storeProvidedByForm) {
    return this.get('createStoreCallback')(storeProvidedByForm);
  },
});
