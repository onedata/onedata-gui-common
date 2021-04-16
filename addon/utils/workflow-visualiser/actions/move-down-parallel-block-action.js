/**
 * Moves down parallel block. Needs parallel block instance passed via context.
 *
 * @module utils/workflow-visualiser/actions/move-down-parallel-block-action
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
  i18nPrefix: 'components.workflowVisualiser.parallelBlock.actions.moveDownBlock',

  /**
   * @override
   */
  className: 'move-down-parallel-block-action-trigger',

  /**
   * @override
   */
  icon: 'move-down',

  /**
   * @override
   */
  disabled: reads('parallelBlock.isLast'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  parallelBlock: reads('context.parallelBlock'),

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    return result.interceptPromise(this.get('parallelBlock').move(1))
      .then(() => result, () => result);
  },
});
