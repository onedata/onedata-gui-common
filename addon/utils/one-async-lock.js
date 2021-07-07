/**
 * Asynchronous lock that allows to acquire a lock and then check it synchronously or
 * asynchronously wait for it to be released.
 *
 * @module utils/one-async-lock
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { defer } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { get } from '@ember/object';

export default class OneAsyncLock {
  async acquire() {
    while (this.isBusy()) {
      await this.wait();
    }
    this.lockDeferred = defer();
    this.lockPromiseObject = promiseObject(this.lockDeferred.promise);
  }
  async release() {
    if (!this.isBusy()) {
      return;
    }
    return this.lockDeferred && this.lockDeferred.resolve();
  }
  isBusy() {
    return Boolean(
      this.lockPromiseObject && get(this.lockPromiseObject, 'isPending')
    );
  }
  async wait() {
    while (this.isBusy()) {
      await this.lockPromiseObject;
    }
  }
}
