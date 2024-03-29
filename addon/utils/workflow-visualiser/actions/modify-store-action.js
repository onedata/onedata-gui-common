/**
 * Modifies store. Needs store passed via context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { get, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default Action.extend({
  modalManager: service(),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  store: reads('context.store'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.ActionsFactory>}
   */
  actionsFactory: reads('context.actionsFactory'),

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    return this.modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'edit',
        store: this.store,
        actionsFactory: this.actionsFactory,
        onSubmit: storeProvidedByForm =>
          result.interceptPromise(this.modifyStore(storeProvidedByForm)),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async modifyStore(storeProvidedByForm) {
    const store = this.get('store');
    const diff = this.getMinimalDiff(storeProvidedByForm);
    if (diff) {
      return store.modify(diff);
    }
  },

  getMinimalDiff(storeProvidedByForm) {
    const store = this.get('store');

    const keysToCheck = [
      'name',
      'description',
      'type',
      'config',
      'defaultInitialContent',
      'requiresInitialContent',
    ];

    const modifiedKeys = keysToCheck.filter(key =>
      !_.isEqual(get(store, key), get(storeProvidedByForm, key))
    );

    return modifiedKeys.length ?
      getProperties(storeProvidedByForm, ...modifiedKeys) : null;
  },
});
