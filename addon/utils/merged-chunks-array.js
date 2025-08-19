/**
 * Replacing chunks array that fetches data from multiple sources having the same format
 * of index. Items from multiple sources are merged into single array with index sorting.
 *
 * In this chunks array, you must implement the `fetchers` property, which is array of
 * fetch functions, instead of `fetch` directly.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ReplacingChunksArray from './replacing-chunks-array';
import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import onlyFulfilledValues from './only-fulfilled-values';

/**
 * @typedef {(index: InfiniteScrollIndex, size: InfiniteScrollSize, offset: InfiniteScrollOffset) => Promise<InfiniteScrollPage>} MergedChunksArrayFetcher
 */

export default class MergedChunksArray extends ReplacingChunksArray {
  /**
   * If true, single fetcher's error will not throw error for the whole fetch (which is a
   * default). Set to false to not tolerate single fetchers errors.
   * @type {boolean}
   */
  ignoreFetcherErrors = true;

  /**
   * Collection of fetch functions, whose results will be merged and sorted when using
   * this chunks array main fetch method. It could be used when result list must be
   * collected from multiple sources, which have their own infinite scroll API (eg. Shares
   * collection from multiple Spaces).
   * @virtual
   * @type {Array<MergedChunksArrayFetcher>}
   */
  get fetchers() {
    throw new Error('MergedChunksArray: fetchers not implemented');
  }

  set fetchers(value) {
    defineFetchersUsingValue(this, value);
  }

  /**
   * @override
   * @param {InfiniteScrollIndex} index
   * @param {InfiniteScrollSize} size
   * @param {InfiniteScrollOffset} offset
   * @returns {Promise<ChunksFetchResult>}
   */
  async fetch(index, size, offset) {
    const effSize = offset > 0 ? (size + offset) : size;
    const effOffset = offset > 0 ? 0 : offset;
    const results = await this.executeAllFetchers(index, effSize, effOffset);
    return mergeResults(results, { index, size, offset });
  }

  /**
   * Invokes fetchers paralelly (all requests sent at once).
   * @protected
   * @param {InfiniteScrollIndex} index
   * @param {InfiniteScrollSize} size
   * @param {InfiniteScrollOffset} offset
   * @returns {Promise<Array<InfiniteScrollPage>>}
   */
  async executeAllFetchers(index, size, offset) {
    const allResolver = this.ignoreFetcherErrors ? onlyFulfilledValues : allFulfilled;
    return await allResolver(
      this.fetchers.map(fetcher => fetcher(index, size, offset))
    );
  }
}

/**
 * Allows to set fetchers property using value, without need to override getter.
 * @param {MergedChunksArray} self
 * @param {Array<MergedChunksArrayFetcher>} value
 */
function defineFetchersUsingValue(self, value) {
  Object.defineProperty(self, 'fetchers', {
    configurable: true,
    get() {
      return value;
    },
    set(value) {
      defineFetchersUsingValue(self, value);
    },
  });
}

/**
 * @param {Array<ChunksFetchResult>} results
 * @param {InfiniteListQuery} query Size in this query can be null which means that result
 *   should not be trimmed.
 * @returns {ChunksFetchResult}
 */
export function mergeResults(results, query) {
  const { index, size, offset } = query;
  const isInfiniteSize = size === null;
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
    if (itemWithIndexPosition !== -1 && !isInfiniteSize) {
      // Do not bother start of slice (always 0), because with the negative
      // index, we get sortedArray items from the end.
      sortedArray = sortedArray.slice(0, itemWithIndexPosition + size + offset);
    }
  }
  let finalArray = sortedArray;
  if (!isInfiniteSize) {
    let sliceRange;
    if (offset >= 0) {
      sliceRange = [0, size];
    } else {
      // TODO: VFS-12643 Write test: fetching with negative offset, which results in
      // lesser items than expected. Before the "Math.max" code below, the array has been
      // left corrupted (it used negative value in slice).
      sliceRange = [Math.max(sortedArray.length - size, 0), sortedArray.length];
    }
    finalArray = sortedArray.slice(...sliceRange);
  }
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
