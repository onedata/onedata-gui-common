/**
 * Creates new task. Needs:
 * - definedStores,
 * - taskDetailsProviderCallback - it will be called to obtain new task details,
 * - task.
 *
 * @module utils/workflow-visualiser/actions/modify-task-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { getProperties, get } from '@ember/object';
import _ from 'lodash';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.workflowVisualiser.task.actions.modifyTask',

  /**
   * @override
   */
  className: 'modify-task-action-trigger',

  /**
   * @override
   */
  icon: 'rename',

  /**
   * @type {ComputedProperty<Object>}
   */
  task: reads('context.task'),

  /**
   * @type {ComputedProperty<Array<Utils.WorkflowVisualiser.Store>>}
   */
  definedStores: reads('context.definedStores'),

  /**
   * @type {ComputedProperty<Function>}
   * @param {Array<Object>} initialData.definedStores
   * @param {Array<Object>} initialData.task
   * @returns {Promise<Object>} task details
   */
  taskDetailsProviderCallback: reads('context.taskDetailsProviderCallback'),

  /**
   * @override
   */
  onExecute() {
    const {
      task,
      definedStores,
      taskDetailsProviderCallback,
    } = this.getProperties(
      'task',
      'definedStores',
      'taskDetailsProviderCallback',
    );
    const result = ActionResult.create();
    const modifyPromise = taskDetailsProviderCallback({ definedStores, task })
      .then(taskData => this.modifyTask(taskData));
    return result.interceptPromise(modifyPromise)
      .then(() => result, () => result);
  },

  async modifyTask(taskData) {
    const task = this.get('task');
    const diff = this.getMinimalDiff(taskData);
    if (diff) {
      return task.modify(diff);
    }
  },

  getMinimalDiff(taskData) {
    const task = this.get('task');

    const keysToCheck = [
      'name',
      'argumentMappings',
      'resultMappings',
      'resourceSpecOverride',
    ];

    const modifiedKeys = keysToCheck.filter(key =>
      !_.isEqual(get(task, key), get(taskData, key))
    );

    return modifiedKeys.length ?
      getProperties(taskData, ...modifiedKeys) : null;
  },
});
