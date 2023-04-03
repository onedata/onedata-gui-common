/**
 * Creates new lane. Needs definedStores and createLaneCallback passed via context.
 * The latter will be used to save a new lane.
 *
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
  i18nPrefix: 'components.workflowVisualiser.lane.actions.createLane',

  /**
   * @override
   */
  className: 'create-lane-action-trigger',

  /**
   * @override
   */
  icon: 'plus',

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  definedStores: reads('context.definedStores'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createStoreAction: reads('context.createStoreAction'),

  /**
   * @type {ComputedProperty<Function>}
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  createLaneCallback: reads('context.createLaneCallback'),

  /**
   * @override
   */
  onExecute() {
    const {
      modalManager,
      definedStores,
      createStoreAction,
    } = this.getProperties('modalManager', 'definedStores', 'createStoreAction');

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/lane-modal', {
        mode: 'create',
        definedStores,
        createStoreAction,
        onSubmit: laneProvidedByForm =>
          result.interceptPromise(this.createLane(laneProvidedByForm)),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  createLane(laneProvidedByForm) {
    return this.get('createLaneCallback')(Object.assign({
      parallelBoxes: [],
    }, laneProvidedByForm));
  },
});
