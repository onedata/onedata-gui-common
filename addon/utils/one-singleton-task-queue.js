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
    const existingTask = this.queue.findBy('type', taskType);
    if (existingTask) {
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
  async _executeQueue() {
    let task = this.queue[0];
    while (task) {
      try {
        const result = await task.fun.call();
        task.deferred.resolve(result);
      } finally {
        this.queue.shift();
      }
      task = this.queue[0];
    }
  }
}
