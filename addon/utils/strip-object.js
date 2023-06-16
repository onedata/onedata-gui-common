/**
 * Remove object keys that have specific values
 *
 * Works only on flat objects - does not go recursively!
 * The comparison is done by indexOf (so by ``===`` operator).
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {Object} orig
 * @param {Array<unknown>} [falsyValues]
 * @returns {Object};
 */
export default function stripObject(orig, falsyValues = [undefined, null]) {
  const stripped = {};
  let testForNan = false;
  const nanIndex = falsyValues.findIndex(fv => Number.isNaN(fv));
  if (nanIndex !== -1) {
    testForNan = true;
    delete falsyValues[nanIndex];
  }
  for (const key in orig) {
    const value = orig[key];
    if (
      (testForNan ? !Number.isNaN(value) : true) &&
      falsyValues.indexOf(value) === -1
    ) {
      stripped[key] = value;
    }
  }
  return stripped;
}
