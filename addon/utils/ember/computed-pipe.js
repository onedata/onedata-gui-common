/**
 * Creates computed property that returns value of another property using some
 * functions (by function) or methods (by name).
 *
 * See tests for use examples.
 * 
 * @module utils/ember/computed-pipe
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function emberComputedPipe() {
  const functions = Array.prototype.slice.call(arguments, 1, arguments.length);
  const key = arguments[0];
  return computed(key, function () {
    let buf = this.get(key);
    functions.forEach(fun => {
      if (typeof fun === 'function') {
        buf = fun(buf);
      } else if (typeof fun === 'string') {
        buf = this[fun](buf);
      }
    });
    return buf;
  });
}
