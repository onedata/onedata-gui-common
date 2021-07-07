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

export default class OneSingletonTaskQueue {
  constructor() {
    this.queue = [];
    this.executionPromiseObject = null;
  }
  scheduleTask(taskType, fun) {
    if (this.queue.findBy('type', taskType)) {
      return;
    }
    this.queue.push({
      type: taskType,
      fun,
    });
    return this.tryExecuteQueue();
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
        await task.fun.call();
      } finally {
        this.queue.shift();
      }
      task = this.queue[0];
    }
  }
}
