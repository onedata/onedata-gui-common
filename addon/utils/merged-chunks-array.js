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
      // If at last one fetcher has not-last chunk, then the whole query is not last.
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
        // Do not bother start of slice (always 0), because with the negative
        // index, we get sortedArray items from the end.
        sortedArray = sortedArray.slice(0, itemWithIndexPosition + size + offset);
      }
    }
    let sliceRange;
    if (offset >= 0) {
      sliceRange = [0, size];
    } else {
      // FIXME: napisać test nieprzechodzący do kodu z developa (bez Math.max)
      // pobieramy chunka z ujemnym offsetem i zwraca nam mniej elementów niż chcieliśmy (size)
      // wcześniej tablica była rozwalona (bo używało ujemnej wartości w range)
      sliceRange = [Math.max(sortedArray.length - size, 0), sortedArray.length];
    }
    const finalArray = _.sortBy(sortedArray, 'index').slice(...sliceRange);
    let isLast;
    if (finalArray.length < mergedResult.array.length) {
      // We have more items in the source than will be returned, so it cannot be the end
      // regardless of any isLast.
      isLast = false;
    } else {
      // All chunks have been used - it will be not the last merged chunk only if there is
      // at last single non-last chunk (see how global isLast is computed earlier).
      isLast = mergedResult.isLast;
    }
    return { array: finalArray, isLast };
  }
}
