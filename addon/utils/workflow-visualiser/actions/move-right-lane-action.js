/**
 * Moves right lane. Needs lane instance passed via context.
 *
 * @module utils/workflow-visualiser/actions/move-right-lane-action
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
  i18nPrefix: 'components.workflowVisualiser.lane.actions.moveRightLane',

  /**
   * @override
   */
  className: 'move-right-lane-action-trigger',

  /**
   * @override
   */
  icon: 'move-right',

  /**
   * @override
   */
  disabled: reads('lane.isLast'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  lane: reads('context.lane'),

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    return result.interceptPromise(this.get('lane').move(1))
      .then(() => result, () => result);
  },
});
