/**
 * Creates new parallel block. Needs createParallelBlockCallback passed via context.
 * It will then be used to save a new parallel block.
 *
 * @module utils/workflow-visualiser/actions/create-parallel-block-action
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

  // TODO: VFS-7577 change "block" to full "parallel block" name
  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.parallelBlock.actions.createBlock',

  /**
   * @override
   */
  className: 'create-parallel-block-action-trigger',

  /**
   * @override
   */
  icon: 'add-filled',

  /**
   * @type {ComputedProperty<Function>}
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  createParallelBlockCallback: reads('context.createParallelBlockCallback'),

  /**
   * @override
   */
  onExecute() {
    const newParallelBlockProps = {
      type: 'parallelBlock',
      name: String(this.t('newParallelBlockName')),
      tasks: [],
    };

    const result = ActionResult.create();
    return result.interceptPromise(
      this.get('createParallelBlockCallback')(newParallelBlockProps)
    ).then(() => result, () => result);
  },
});
