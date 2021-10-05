/**
 * Creates a function that invokes provided `func` only if time from last invocation
 * (`timeSpacing`) elapsed.
 * In contrast to Ember throttle, this makes last invocation of function after
 * timeSpacing if there is no invocations.
 *
 * @module utils/create-throttled-function
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { later } from '@ember/runloop';

/**
 * @param {Function} func
 * @param {Number} timeSpacing in milliseconds
 * @param {Boolean} [debounce=false] if true, calls will be debounced (not invoked
 *   immediately even if throttling time elapsed)
 * @returns {Function}
 */
export default function createThrottledFunction(func, timeSpacing, debounce = false) {
  let lastFunc;
  let lastRan;
  let runDebounced = !debounce;
  return function throttledFunction() {
    if (!runDebounced) {
      lastRan = Date.now();
      runDebounced = true;
    }
    if (!lastRan || timeSpacing - (Date.now() - lastRan) <= 0) {
      func();
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = later(function () {
        if ((Date.now() - lastRan) >= timeSpacing) {
          func();
          lastRan = Date.now();
          runDebounced = false;
        }
      }, timeSpacing - (Date.now() - lastRan));
    }
  };
}
