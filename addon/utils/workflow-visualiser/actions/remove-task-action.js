/**
 * Removes task. Needs task instance passed via context.
 *
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
  i18nPrefix: 'components.workflowVisualiser.task.actions.removeTask',

  /**
   * @override
   */
  className: 'remove-task-action-trigger',

  /**
   * @override
   */
  icon: 'browser-delete',

  /**
   * @type {ComputedProperty<Utils.WorkflowVisualiser.Lane.Task>}
   */
  task: reads('context.task'),

  /**
   * @override
   */
  onExecute() {
    const {
      task,
      modalManager,
    } = this.getProperties(
      'task',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            taskName: get(task, 'name'),
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonType: 'danger',
        onSubmit: () =>
          result.interceptPromise(task.remove()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },
});
