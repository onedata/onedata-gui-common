/**
 * Moves up parallel box. Needs parallel box instance passed via context.
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
  i18nPrefix: 'components.workflowVisualiser.parallelBox.actions.moveUpParallelBox',

  /**
   * @override
   */
  className: 'move-up-parallel-box-action-trigger',

  /**
   * @override
   */
  icon: 'move-up',

  /**
   * @override
   */
  disabled: reads('parallelBox.isFirst'),

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane>}
   */
  parallelBox: reads('context.parallelBox'),

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    return result.interceptPromise(this.get('parallelBox').move(-1))
      .then(() => result, () => result);
  },
});
