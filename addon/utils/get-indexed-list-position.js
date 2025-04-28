/**
 * Find position of item in array as backend does using infinite scroll indexing.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import compareStringBytes from './compare-string-bytes';

/**
 * @param {Array<{ index: string }>} items
 * @param {string} recordIndex Index of item to search (`index` property).
 * @returns {number}
 */
export default function getIndexedListPosition(items, recordIndex) {
  if (recordIndex === null) {
    return 0;
  } else {
    let lastPos = 0;
    while (
      lastPos < items.length &&
      compareStringBytes(items[lastPos].index, recordIndex) === -1
    ) {
      lastPos += 1;
    }
    return lastPos;
  }
}
