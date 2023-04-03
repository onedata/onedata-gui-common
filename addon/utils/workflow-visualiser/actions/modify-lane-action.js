/**
 * Modifies lane. Needs definedStores and lane passed via context.
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
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.lane.actions.modifyLane',

  /**
   * @override
   */
  className: 'modify-lane-action-trigger',

  /**
   * @override
   */
  icon: 'rename',

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  definedStores: reads('context.definedStores'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  createStoreAction: reads('context.createStoreAction'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.lane>}
   */
  lane: reads('context.lane'),

  /**
   * @override
   */
  onExecute() {
    const {
      definedStores,
      createStoreAction,
      lane,
      modalManager,
    } = this.getProperties(
      'definedStores',
      'createStoreAction',
      'lane',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/lane-modal', {
        mode: 'edit',
        definedStores,
        createStoreAction,
        lane,
        onSubmit: laneProvidedByForm =>
          result.interceptPromise(this.modifyLane(laneProvidedByForm)),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async modifyLane(laneProvidedByForm) {
    const lane = this.get('lane');
    const diff = this.getMinimalDiff(laneProvidedByForm);
    if (diff) {
      return lane.modify(diff);
    }
  },

  getMinimalDiff(laneProvidedByForm) {
    const lane = this.get('lane');

    const keysToCheck = [
      'name',
      'maxRetries',
      'storeIteratorSpec',
    ];

    const modifiedKeys = keysToCheck.filter(key =>
      !_.isEqual(get(lane, key), get(laneProvidedByForm, key))
    );

    return modifiedKeys.length ?
      getProperties(laneProvidedByForm, ...modifiedKeys) : null;
  },
});
