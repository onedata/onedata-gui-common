/**
 * Compares two arrays using their raw byte representation.
 *
 * Unicode strings could have characters that have more-than-single-byte length. This
 * function breaks two unicode strings to raw byte arrays and compares them. It could
 * result in different result than standard locale compare in JS.
 *
 * For example, having two strings and their conversion to byte arrays:
 *
 * - "żśćźół" -> [197,188,197,155,196,135,197,186,195,179,197,130]
 * - "żśćźoł" -> [197,188,197,155,196,135,197,186,111,197,130]
 *
 * The result of comparison is: "żśćźół" > "żśćźoł".
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import compareNumberArrays from './compare-number-arrays';

/**
 *
 * @param {string} a
 * @param {string} b
 * @returns {-1|0|1} Negative if `a < b`; zero if `a == b`; positive if `a > b`.
 */
export default function compareStringBytes(a, b) {
  if (a === b) {
    return 0;
  }
  return compareNumberArrays(stringToBytes(a), stringToBytes(b));
}

/**
 * @param {string} text
 * @returns {Array<number>} Number in range 0-255.
 */
function stringToBytes(text) {
  return Array.from(new TextEncoder().encode(text));
}
