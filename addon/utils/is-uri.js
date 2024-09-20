/**
 * Check if given string is a URI.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import isUriLib from 'isuri';

/**
 * @param {string} value
 * @returns {boolean} True, if the value is a URI.
 */
export default function isUri(value) {
  return isUriLib.isValid(value);
}
