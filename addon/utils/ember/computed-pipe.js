/**
 * Creates computed property that returns value of another property using some
 * functions (by function) or methods (by name).
 *
 * See tests for use examples.
 *
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function emberComputedPipe() {
  const functions = Array.prototype.slice.call(arguments, 1, arguments.length);
  const key = arguments[0];
  return computed(key, function () {
    const value = this.get(key);
    return functions.reduce((currentValue, fun) => {
      if (typeof fun === 'function') {
        return fun(currentValue);
      } else if (typeof fun === 'string') {
        return this[fun](currentValue);
      } else {
        return currentValue;
      }
    }, value);
  });
}
