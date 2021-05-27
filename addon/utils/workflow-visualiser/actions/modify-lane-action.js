/**
 * Modifies lane. Needs stores and lane passed via context.
 *
 * @module utils/workflow-visualiser/actions/modify-lane-action
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
  stores: reads('context.stores'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.lane>}
   */
  lane: reads('context.lane'),

  /**
   * @override
   */
  onExecute() {
    const {
      stores,
      lane,
      modalManager,
    } = this.getProperties(
      'stores',
      'lane',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('workflow-visualiser/lane-modal', {
        mode: 'edit',
        stores,
        lane,
        onSubmit: laneFromForm =>
          result.interceptPromise(this.modifyLane(laneFromForm)),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async modifyLane(laneFromForm) {
    const lane = this.get('lane');
    const diff = this.getMinimalDiff(laneFromForm);
    if (diff) {
      return lane.modify(diff);
    }
  },

  getMinimalDiff(laneFromForm) {
    const lane = this.get('lane');

    const keysToCheck = [
      'name',
      'storeIteratorSpec',
    ];

    const modifiedKeys = keysToCheck.filter(key =>
      !_.isEqual(get(lane, key), get(laneFromForm, key))
    );

    return modifiedKeys.length ?
      getProperties(laneFromForm, ...modifiedKeys) : null;
  },
});
