/**
 * Various utils for tests using ReplacingChunksArray
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { get } from '@ember/object';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';

export const defaultMockArraySize = 1000;

export class Record {
  constructor(index) {
    this.index = index;
    this.id = index;
  }
}

export function recordRange(start, end) {
  return _.range(start, end).map(i => new Record(i));
}

export class MockArray {
  constructor() {
    this.array = recordRange(0, defaultMockArraySize);
  }
  async fetch(
    fromIndex,
    size = Number.MAX_SAFE_INTEGER,
    offset = 0
  ) {
    const effFromIndex = fromIndex == null ? Number.MIN_SAFE_INTEGER : fromIndex;
    let startIndex = 0;
    for (let i = 0; i < this.array.length; ++i) {
      startIndex = i;
      if (this.array[i].index >= effFromIndex) {
        break;
      }
    }
    const startOffset = Math.max(
      0,
      Math.min(startIndex + offset, this.array.length)
    );
    const endOffset = Math.min(startOffset + size, this.array.length);
    return this.array.slice(startOffset, endOffset);
  }
}

export function removeFromArray(array, pos) {
  return [...array.slice(0, pos), ...array.slice(pos + 1, array.length)];
}

export function addToArray(array, pos, ...items) {
  return [...array.slice(0, pos), ...items, ...array.slice(pos, array.length)];
}

export function mapIndex(array) {
  return array.toArray().map(i => i && get(i, 'index'));
}

export function inspect(rca) {
  return `_start: ${get(rca, '_start')}; _end: ${get(rca, '_end')}; ` +
    `array: ${mapIndex(rca)}; ` +
    `source: ${mapIndex(get(rca, 'sourceArray'))}`;
}

export function createMockReplacingChunksArray(rcaOptions = {}) {
  const mockArray = new MockArray();
  const fetch = MockArray.prototype.fetch.bind(mockArray);
  return ReplacingChunksArray.create(Object.assign({
    fetch,
  }, rcaOptions));
}
