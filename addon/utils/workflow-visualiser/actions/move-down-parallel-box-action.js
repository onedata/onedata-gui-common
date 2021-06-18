/**
 * Moves down parallel box. Needs parallel box instance passed via context.
 *
 * @module utils/workflow-visualiser/actions/move-down-parallel-box-action
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
  i18nPrefix: 'components.workflowVisualiser.parallelBox.actions.moveDownParallelBox',

  /**
   * @override
   */
  className: 'move-down-parallel-box-action-trigger',

  /**
   * @override
   */
  icon: 'move-down',

  /**
   * @override
   */
  disabled: reads('parallelBox.isLast'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  parallelBox: reads('context.parallelBox'),

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    return result.interceptPromise(this.get('parallelBox').move(1))
      .then(() => result, () => result);
  },
});
