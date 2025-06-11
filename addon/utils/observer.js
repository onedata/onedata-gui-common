/**
 * Alias for creating async observer without need to provide object into original observer
 * function.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer } from '@ember/object';

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

export class PropertyAsyncObserver extends EmberObject {
  /**
   * A local path to observed property. On change of the value, the `onChange` callback
   * will be executed.
   * @virtual
   * @type {string}
   */
  path;

  /**
   * Callback executed asynchronously when value in the `path` in this object is changed.
   * @virtual
   * @type {() => void}
   */
  onChange;

  /**
   * @type {Ember.Observer}
   */
  pathObserver;

  init() {
    super.init(...arguments);
    if (typeof this.path !== 'string') {
      throw new Error('PropertyAsyncObserver: path is not a string');
    }
    if (typeof this.onChange !== 'function') {
      throw new Error('PropertyAsyncObserver: onChange callback is not a function');
    }
    this.addObserver(this.path, this, 'handleChange', false);
  }

  willDestroy() {
    this.removeObserver(this.path, this, 'handleChange', false);
  }

  handleChange() {
    return this.onChange(this.get(this.path));
  }
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
