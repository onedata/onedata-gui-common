/**
 * Creates new task. Needs:
 * - stores,
 * - taskDetailsProviderCallback - it will be called to obtain new task details,
 * - createTaskCallback - it will be used to save a new task.
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
  className: 'create-task-action-trigger',

  /**
   * @override
   */
  icon: 'add-filled',

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  stores: reads('context.stores'),

  /**
   * @type {ComputedProperty<Function>}
   * @param {Array<Object>} initialData.stores
   * @returns {Promise<Object>} task details
   */
  taskDetailsProviderCallback: reads('context.taskDetailsProviderCallback'),

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
    const {
      stores,
      taskDetailsProviderCallback,
      createTaskCallback,
    } = this.getProperties(
      'stores',
      'taskDetailsProviderCallback',
      'createTaskCallback'
    );
    const result = ActionResult.create();
    const createPromise = taskDetailsProviderCallback({ stores })
      .then(taskData => createTaskCallback(taskData));
    return result.interceptPromise(createPromise)
      .then(() => result, () => result);
  },
});
