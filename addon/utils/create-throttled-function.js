/**
 * Creates a function that ivokes provided `func` only if time from last invocation
 * (`timeSpacing`) elapsed.
 * In contrast to Ember throttle, this makes last invocation of function after limit
 * time if there is no invocations.
 *
 * @module utils/create-throttled-function
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { later } from '@ember/runloop';

/**
 * @param {Function} func
 * @param {Number} timeSpacing in milliseconds
 * @returns {Function}
 */
export default function createThrottledFunction(func, timeSpacing) {
  let lastFunc;
  let lastRan;
  return function throttledFunction() {
    if (!lastRan || timeSpacing - (Date.now() - lastRan) <= 0) {
      func();
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = later(function () {
        if ((Date.now() - lastRan) >= timeSpacing) {
          func();
          lastRan = Date.now();
        }
      }, timeSpacing - (Date.now() - lastRan));
    }
  };
}
