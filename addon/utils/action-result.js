/**
 * A container class for an action result.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { reject } from 'rsvp';

export default EmberObject.extend({
  /**
   * One of: pending, done, failed, cancelled
   * @type {string}
   */
  status: 'pending',

  /**
   * Action result (when status is done)
   * @type {any}
   */
  result: null,

  /**
   * Action error (when status is error)
   * @type {any}
   */
  error: null,

  /**
   * If true, then action execution which created that result was an "undo"
   * execution.
   * @type {boolean}
   */
  undo: false,

  /**
   * Place for some additional data which is not a result/error
   * @type {any}
   */
  additionalData: null,

  cancelIfPending() {
    if (this.get('status') === 'pending') {
      this.set('status', 'cancelled');
    }
  },

  /**
   * Intercepts promise result. If promise resolves, then status changes to 'done'
   * and result changes to value returned by promise. If promise rejectes then
   * status changes to 'failed' and error changes to value returned by promise.
   * @param {Promise} promise
   * @returns {Promise} promise passed as an argument
   */
  interceptPromise(promise) {
    return promise
      .then(result => {
        safeExec(this, () => this.setProperties({
          status: 'done',
          result,
        }));
        return result;
      })
      .catch(error => {
        safeExec(this, () => this.setProperties({
          status: 'failed',
          error,
        }));
        return reject(error);
      });
  },
});
