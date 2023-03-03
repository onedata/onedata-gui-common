/**
 * Creates new parallel box. Needs createParallelBoxCallback passed via context.
 * It will then be used to save a new parallel box.
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
  i18nPrefix: 'components.workflowVisualiser.parallelBox.actions.createParallelBox',

  /**
   * @override
   */
  className: 'create-parallel-box-action-trigger',

  /**
   * @override
   */
  icon: 'add-filled',

  /**
   * @type {ComputedProperty<Function>}
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  createParallelBoxCallback: reads('context.createParallelBoxCallback'),

  /**
   * @override
   */
  onExecute() {
    const newParallelBoxProps = {
      name: String(this.t('newParallelBoxName')),
      tasks: [],
    };

    const result = ActionResult.create();
    return result.interceptPromise(
      this.get('createParallelBoxCallback')(newParallelBoxProps)
    ).then(() => result, () => result);
  },
});
