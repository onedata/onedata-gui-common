/**
 * Ordered queue of tasks, which can hold only one task of specified type until the task
 * of a speficied type is completed. Supports asynchronous tasks.
 *
 * @author Jakub Liput
 * @copyright (C) 2021-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { get } from '@ember/object';
import { defer } from 'rsvp';

/**
 * @typedef {Object} OneSingletonTaskQueueScheduleOptions
 * @property {string} [insertBeforeType] If provided, the task will be insterted not on
 *   the queue end, but before the specified type (if the task of specified type exists)
 *   in the queue).
 */

export default class OneSingletonTaskQueue {
  constructor() {
    this.queue = [];
    this.executionPromiseObject = null;
    this.currentTask = null;
  }

  /**
   * Adds a new task to queue only if there is no other task currently in the queue
   * with the same type. If the task already exists - returns promise of existing
   * task completion.
   * @param {string} taskType
   * @param {() => Promise} fun
   * @param {OneSingletonTaskQueueScheduleOptions} options
   * @returns {Promise}
   */
  scheduleTask(taskType, fun, options = {}) {
    console.debug('util:one-singleton-task-queue: schedule', taskType);
    const existingTask = this.queue.findBy('type', taskType);
    if (existingTask) {
      console.debug('util:one-singleton-task-queue: already exists', taskType);
      return existingTask.deferred.promise;
    }
    return this._scheduleTask(taskType, fun, options);
  }

  /**
   * **NOTE: only for special usages. If not sure, use `scheduleTask` method.**
   *
   * Forces putting the task into queue without checking if other task with the same type
   * exists.
   * Do not use this method until you are not sure what you are doing, because it makes
   * the queue to contain non-singletons. This method is useful if you want to add task
   * with existing type, but the current task is still not resolved.
   *
   * @param {string} taskType
   * @param {() => Promise} fun
   * @param {OneSingletonTaskQueueScheduleOptions} options
   * @returns {Promise}
   */
  forceScheduleTask(taskType, fun, options = {}) {
    console.debug('util:one-singleton-task-queue: force schedule', taskType);
    return this._scheduleTask(taskType, fun, options);
  }

  tryExecuteQueue() {
    if (this.executionPromiseObject && get(this.executionPromiseObject, 'isPending')) {
      return this.executionPromiseObject;
    }
    this.executionPromiseObject = promiseObject(this._executeQueue());
    return this.executionPromiseObject;
  }

  /**
   * Get promise for currently executed task or return empty resolving promise.
   * @returns {Promise}
   */
  async getCurrentTaskPromise() {
    if (!this.currentTask || !this.currentTask.deferred) {
      return;
    }
    return this.currentTask.deferred.promise;
  }

  /**
   * Get promise for task with `taskName` or return empty resolving promise.
   * @returns {Promise}
   */
  async getTaskPromise(taskType) {
    const queue = this.queue;
    const task = queue && queue.findBy('type', taskType);
    return task && task.deferred.promise;
  }

  async _executeQueue() {
    this.currentTask = this.queue[0];
    while (this.currentTask) {
      console.debug('util:one-singleton-task-queue: exec', this.currentTask.type);
      try {
        const result = await this.currentTask.fun.call();
        this.queue.shift();
        this.currentTask.deferred.resolve(result);
        console.debug('util:one-singleton-task-queue: resolved', this.currentTask.type);
      } catch (error) {
        this.queue.shift();
        this.currentTask.deferred.reject(error);
        console.debug('util:one-singleton-task-queue: rejected', this.currentTask.type);
      }
      this.currentTask = this.queue[0];
    }
    this.currentTask = null;
  }

  /**
   * @private
   * @param {string} taskType
   * @param {() => Promise} fun
   * @param {OneSingletonTaskQueueScheduleOptions} options
   * @returns
   */
  _scheduleTask(taskType, fun, options) {
    const deferred = defer();
    const task = {
      type: taskType,
      fun,
      deferred,
    };
    let hasBeenInserted = false;
    if (options.insertBeforeType) {
      const beforeTaskIndex = this.queue.findIndex(existingTask =>
        existingTask.type === options.insertBeforeType &&
        // do not put task before other, if this task is currently running
        existingTask !== this.currentTask
      );
      if (beforeTaskIndex !== -1) {
        this.queue.splice(beforeTaskIndex, 0, task);
        hasBeenInserted = true;
      }
    }
    // if it's not a special case - insert new task on the end
    if (!hasBeenInserted) {
      this.queue.push(task);
    }
    this.tryExecuteQueue();
    return deferred.promise;
  }
}
