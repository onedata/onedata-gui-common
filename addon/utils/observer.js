/**
 * Alias for creating async observer without need to provide object into original observer
 * function.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { observer } from '@ember/object';

/**
 * Create **asynchronous** Ember Observer.
 * Arguments are the same as for original observer function, but not supporting
 * "overloaded" API for observer. See: https://rfcs.emberjs.com/id/0494-async-observers
 * @returns {Ember.Observer}
 */
export function asyncObserver() {
  return createObserver(false, ...arguments);
}

/**
 * Create **synchronous** Ember Observer.
 * Arguments are the same as for original observer function, but not supporting
 * "overloaded" API for observer. See: https://rfcs.emberjs.com/id/0494-async-observers
 * @returns {Ember.Observer}
 */
export function syncObserver() {
  return createObserver(true, ...arguments);
}

/**
 * @param {boolean} sync Is observer synchronous? See `sync` property of overfloaded API:
 *   https://rfcs.emberjs.com/id/0494-async-observers
 * @param  {...any} args Arguments for regular API of observer (keys and function).
 * @returns {Ember.Observer}
 */
function createObserver(sync, ...args) {
  const dependentKeys = args.slice(0, args.length - 1);
  const fn = args[args.length - 1];
  return observer({
    dependentKeys,
    sync,
    fn,
  });
}
