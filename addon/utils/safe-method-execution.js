/**
 * Invoke method on Ember.Object with checking destroy flags
 *
 * @module utils/safe-method-execution
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @param {Ember.Object} obj 
 * @param {string} methodName
 * @returns {any} value returned by method or undefined on destroying error
 */
export default function safeMethodExecution(obj, methodName, ...params) {
  if (!obj.isDestroyed && !obj.isDestroying) {
    return obj[methodName](...params);
  } else {
    console.warn(
      `util:safe-method-execution: Cannot execute ${methodName} on ` +
      `Ember.Object because it is destroyed`
    );
  }
}
