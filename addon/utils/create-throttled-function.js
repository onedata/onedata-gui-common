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

import { later, cancel } from '@ember/runloop';

/**
 * @param {Function} func
 * @param {Number} timeSpacing in milliseconds
 * @param {Boolean} [immediate=true] trigger the function on the leading instead of
 *   the trailing edge of the wait interval
 * @returns {Function}
 */
export default function createThrottledFunction(func, timeSpacing, immediate = true) {
  let timeoutId;
  let lastRan;
  let runPostponed = immediate;
  return function throttledFunction() {
    if (!immediate && !runPostponed) {
      lastRan = Date.now();
      runPostponed = true;
      if (timeoutId) {
        cancel(timeoutId);
        timeoutId = null;
      }
    }
    if (!lastRan || timeSpacing - (Date.now() - lastRan) <= 0) {
      func();
      lastRan = Date.now();
    } else if (!timeoutId) {
      timeoutId = later(function () {
        if ((Date.now() - lastRan) >= timeSpacing) {
          func();
          lastRan = Date.now();
          runPostponed = false;
          cancel(timeoutId);
          timeoutId = null;
        }
      }, timeSpacing - (Date.now() - lastRan));
    }
  };
}
