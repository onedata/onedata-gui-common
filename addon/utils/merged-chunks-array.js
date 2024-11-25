// FIXME: jsdoc

import ReplacingChunksArray from './replacing-chunks-array';
import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';

export default class MergedChunksArray extends ReplacingChunksArray {
  /**
   * @virtual
   * @type {Array<ChunksFetchFunction>}
   */
  get fetchers() {
    return undefined;
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
    return _.sortBy(mergedResult.array, 'index').slice(0, size);
  }
}
