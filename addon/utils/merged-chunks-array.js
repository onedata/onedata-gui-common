// FIXME: jsdoc

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
    // FIXME: testy z ujemnym offset (fetch prev)
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
        } else {
          effArray = _.dropRight(effArray, offset);
        }
      }
      merged.array.push(...effArray);
      if (result.isLast === false) {
        merged.isLast = false;
      }
      return merged;
    }, { array: [], isLast: true });
    // FIXME: jeśli jest ujemny offset, to: posortować, uciąć tablicę na index (jeśli jest), i brać slice z końcówki
    let sortedArray = _.sortBy(mergedResult.array, 'index');
    if (offset < 0) {
      const itemWithIndexPosition = _.findLastIndex(sortedArray, item =>
        item.index === index
      );
      if (itemWithIndexPosition !== -1) {
        sortedArray = sortedArray.slice(0, itemWithIndexPosition);
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
