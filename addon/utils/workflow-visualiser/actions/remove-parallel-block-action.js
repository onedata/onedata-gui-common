/**
 * Removes parallel block. Needs parallel block instance passed via context.
 *
 * @module utils/workflow-visualiser/actions/remove-task-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.parallelBlock.actions.removeBlock',

  /**
   * @override
   */
  className: 'remove-parallel-block-action-trigger',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.ParallelBlock>}
   */
  parallelBlock: reads('context.parallelBlock'),

  /**
   * @override
   */
  onExecute() {
    const {
      parallelBlock,
      modalManager,
    } = this.getProperties(
      'parallelBlock',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            parallelBlockName: get(parallelBlock, 'name'),
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonClassName: 'btn-danger',
        onSubmit: () =>
          result.interceptPromise(parallelBlock.remove()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },
});
