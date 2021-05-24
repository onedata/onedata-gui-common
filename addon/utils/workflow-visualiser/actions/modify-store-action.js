/**
 * Modifies store. Needs store passed via context.
 *
 * @module utils/workflow-visualiser/actions/modify-store-action
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
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.store.actions.modifyStore',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store>}
   */
  store: reads('context.store'),

  /**
   * @override
   */
  onExecute() {
    const {
      store,
      modalManager,
    } = this.getProperties(
      'store',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'edit',
        store,
        onSubmit: storeFromForm =>
          result.interceptPromise(this.modifyStore(storeFromForm)),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async modifyStore(storeFromForm) {
    const store = this.get('store');
    const diff = this.getMinimalDiff(storeFromForm);
    if (diff) {
      return store.modify(diff);
    }
  },

  getMinimalDiff(storeFromForm) {
    const store = this.get('store');

    const keysToCheck = [
      'name',
      'description',
      'type',
      'dataType',
      'defaultInitialValue',
      'requiresInitialValue',
    ];

    const modifiedKeys = keysToCheck.filter(key =>
      !_.isEqual(get(store, key), get(storeFromForm, key))
    );

    return modifiedKeys.length ?
      getProperties(storeFromForm, ...modifiedKeys) : null;
  },
});
