/**
 * Shows failed items of specific lane. Needs `lane` and `getStoreContentCallback` passed via context.
 *
 * @module utils/workflow-visualiser/actions/view-lane-failed-items-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isEmpty } from 'ember-awesome-macros';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.viewLaneFailedItems',

  /**
   * @override
   */
  className: 'view-lane-failed-items-action-trigger',

  /**
   * @override
   */
  icon: 'warning',

  /**
   * @override
   */
  disabled: isEmpty('exceptionStore'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @param {Utils.WorkflowVisualiser.Store} store
   * @type {ComputedProperty<Function>}
   */
  getStoreContentCallback: reads('context.getStoreContentCallback'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Store|undefined>}
   */
  exceptionStore: reads('lane.exceptionStore'),

  /**
   * @override
   */
  onExecute() {
    const {
      exceptionStore,
      getStoreContentCallback,
      modalManager,
    } = this.getProperties(
      'exceptionStore',
      'getStoreContentCallback',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/store-modal', {
        mode: 'view',
        store: exceptionStore,
        getStoreContentCallback: (...args) =>
          getStoreContentCallback(exceptionStore, ...args),
      }).hiddenPromise
      .then(() => {
        set(result, 'status', 'done');
        return result;
      });
  },
});
