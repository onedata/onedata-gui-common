/**
 * Creates new lane. Needs stores and createLaneCallback passed via context.
 * The latter will be used to save a new lane.
 *
 * @module utils/workflow-visualiser/actions/create-lane-action
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
  stores: reads('context.stores'),

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
      stores,
      createStoreAction,
    } = this.getProperties('modalManager', 'stores', 'createStoreAction');

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/lane-modal', {
        mode: 'create',
        stores,
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
