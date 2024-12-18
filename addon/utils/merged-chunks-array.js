/**
 * Replacing chunks array that fetches data from multiple sources having the same format
 * of index. Items from multiple sources are merged into single array with index sorting.
 *
 * In this chunks array, you must implement the `fetchers` property, which is array of
 * fetch functions, instead of `fetch` directly.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ReplacingChunksArray from './replacing-chunks-array';
import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';

export default class MergedChunksArray extends ReplacingChunksArray {
  constructor() {
    super(...arguments);

    /**
     * @virtual
     * @type {Array<ChunksFetchFunction>}
     */
    this.fetchers;
  }

  /**
   * @override
   * @param {string} index
   * @param {number} size
   * @param {number} offset
   */
  async fetch(index, size, offset) {
    const effSize = offset > 0 ? (size + offset) : size;
    const effOffset = offset > 0 ? 0 : offset;
    const results = await allFulfilled(
      this.fetchers.map(fetcher => fetcher(index, effSize, effOffset))
    );
    const mergedResult = results.reduce((merged, result) => {
      let effArray = result.array;
      if (offset > 0) {
        if (effArray[0]?.index === index) {
          effArray = _.tail(effArray, offset);
        } else if (!result.isLast) {
          effArray = _.dropRight(effArray, offset);
        }
      }
      merged.array.push(...effArray);
      if (result.isLast === false) {
        merged.isLast = false;
      }
      return merged;
    }, { array: [], isLast: true });
    let sortedArray = _.sortBy(mergedResult.array, 'index');
    if (offset < 0) {
      const itemWithIndexPosition = _.findLastIndex(sortedArray, item =>
        item.index === index
      );
      if (itemWithIndexPosition !== -1) {
        sortedArray = sortedArray.slice(0, itemWithIndexPosition + size + offset);
      }
    }
    let sliceRange;
    if (offset >= 0) {
      sliceRange = [0, size];
    } else {
      sliceRange = [sortedArray.length - size, sortedArray.length];
    }
    const result = _.sortBy(sortedArray, 'index').slice(...sliceRange);
    return result;
  }
}
