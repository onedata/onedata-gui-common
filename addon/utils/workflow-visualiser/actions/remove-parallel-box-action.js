/**
 * Removes parallel box. Needs parallel box instance passed via context.
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
  i18nPrefix: 'components.workflowVisualiser.parallelBox.actions.removeParallelBox',

  /**
   * @override
   */
  className: 'remove-parallel-box-action-trigger',

  /**
   * @override
   */
  icon: 'remove',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.ParallelBox>}
   */
  parallelBox: reads('context.parallelBox'),

  /**
   * @override
   */
  onExecute() {
    const {
      parallelBox,
      modalManager,
    } = this.getProperties(
      'parallelBox',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            parallelBoxName: get(parallelBox, 'name'),
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonType: 'danger',
        onSubmit: () =>
          result.interceptPromise(parallelBox.remove()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },
});
