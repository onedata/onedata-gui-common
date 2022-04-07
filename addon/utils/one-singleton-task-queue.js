// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable valid-jsdoc */

/**
 * Ordered queue of tasks, which can hold only one task of specified type until the task
 * of a speficied type is completed. Supports asynchronous tasks.
 *
 * @module utils/one-singleton-task-queue
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { get } from '@ember/object';
import { defer } from 'rsvp';

export default class OneSingletonTaskQueue {
  constructor() {
    this.queue = [];
    this.executionPromiseObject = null;
  }
  scheduleTask(taskType, fun) {
    console.debug('util:one-singleton-task-queue: schedule', taskType);
    const existingTask = this.queue.findBy('type', taskType);
    if (existingTask) {
      console.debug('util:one-singleton-task-queue: already exists', taskType);
      return existingTask.deferred.promise;
    }
    const deferred = defer();
    this.queue.push({
      type: taskType,
      fun,
      deferred,
    });
    this.tryExecuteQueue();
    return deferred.promise;
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
    const queue = this.queue;
    if (!queue || !queue[0] || !queue[0].deferred) {
      return;
    }
    return queue[0].deferred.promise;
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
    let task = this.queue[0];
    while (task) {
      console.debug('util:one-singleton-task-queue: exec', task.type);
      try {
        const result = await task.fun.call();
        this.queue.shift();
        task.deferred.resolve(result);
        console.debug('util:one-singleton-task-queue: resolved', task.type);
      } catch (error) {
        this.queue.shift();
        task.deferred.reject(error);
        console.debug('util:one-singleton-task-queue: rejected', task.type);
      }
      task = this.queue[0];
    }
  }
}
