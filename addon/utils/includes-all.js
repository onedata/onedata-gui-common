/**
 * Returns true if `superset` array includes all items from `subset` array.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {Array} superset
 * @param {Array} subset
 * @returns {boolean}
 */
export default function includesAll(superset, subset) {
  if (!Array.isArray(subset) || !subset.length || superset.length < subset.length) {
    return false;
  }
  const supersetSet = new Set(superset);
  for (const item of subset) {
    if (!supersetSet.has(item)) {
      return false;
    }
  }
  return true;
}
