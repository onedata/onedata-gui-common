/**
 * Compares two ordered arrays containg numbers, item by item.
 *
 * The algorithm compares corresponding array indexes - if one array element is greater
 * than another on the same position, the array is considered as greater. If elements are
 * equal - it takes next position in arrays. If there is common prefix and one array is
 * longer than another - the longer array is considered as "greater".
 *
 * Note, that this function does not validate values of array - if some item is not a
 * number, it will compare it with corresponding value using standard JS operators.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {Array<number>} a
 * @param {Array<number>} b
 * @returns {-1|0|1} Negative if `a < b`; zero if `a == b`; positive if `a > b`.
 */
export default function compareNumberArrays(a, b) {
  let i = 0;
  while (i < a.length && i < b.length) {
    if (a[i] === b[i]) {
      i++;
    }
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }
  if (a.length === b.length) {
    return 0;
  }
  if (a.length > i) {
    // A is longer
    return 1;
  } else {
    return -1;
  }
}
