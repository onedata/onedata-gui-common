/**
 * Creates new task. Needs createTaskCallback passed via context. It will then be used
 * to save a new task.
 *
 * @module utils/workflow-visualiser/actions/create-task-action
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
  i18nPrefix: 'components.workflowVisualiser.task.actions.createTask',

  /**
   * @override
   */
  className: 'create-task-action-trigger',

  /**
   * @override
   */
  icon: 'add-filled',

  /**
   * @type {ComputedProperty<Function>}
   * @param {Object} newElementProps
   * @returns {Promise}
   */
  createTaskCallback: reads('context.createTaskCallback'),

  /**
   * @override
   */
  onExecute() {
    const newTaskProps = {
      name: String(this.t('newTaskName')),
    };

    const result = ActionResult.create();
    return result.interceptPromise(this.get('createTaskCallback')(newTaskProps))
      .then(() => result, () => result);
  },
});
