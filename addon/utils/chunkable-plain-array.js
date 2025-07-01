/**
 * Adapter for exposing ChunksArray interface and functionality for plain arrays.
 * Useful when you want to use infinite scroll with plain array.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import { PropertyAsyncObserver } from 'onedata-gui-common/utils/observer';

const defaultChunksArrayOptions = {
  startIndex: 0,
  endIndex: 50,
  indexMargin: 10,
  chunkSize: 10,
  reloadMinSize: 24,
};

export default class ChunkablePlainArray {
  /** @type {ReplacingChunksArray} */
  #chunksArray;

  /** @type {Object} */
  #chunksArrayOptions;

  /** @type {PropertyAsyncObserver} */
  #sourceArrayObserver;

  /** @type {Array} */
  @tracked
  sourceArray;

  /** @type {Array<IndexedItem>} */
  @computed('sourceArray')
  get indexedArray() {
    return this.sourceArray.map((item, index) => new IndexedItem(item, String(index)));
  }

  get chunksArray() {
    if (!this.#chunksArray) {
      this.#chunksArray = this.#createChunksArray(this.#chunksArrayOptions);
    }
    return this.#chunksArray;
  }

  constructor(sourceArray, chunksArrayOptions) {
    if (sourceArray) {
      this.sourceArray = sourceArray;
    }
    this.#chunksArrayOptions = chunksArrayOptions;

    this.#sourceArrayObserver = PropertyAsyncObserver.create({
      path: 'chunkablePlainArray.sourceArray',
      async onChange() {
        const chunksArray = this.chunkablePlainArray.chunksArray;
        await chunksArray.taskQueue.waitForAllTasks();
        await chunksArray.scheduleReload({ head: true });
      },
      chunkablePlainArray: this,
    });
  }

  #createChunksArray(chunksArrayOptions) {
    return ReplacingChunksArray.create({
      fetch: (index, limit, offset) => {
        const arrayIndex = index == null ? 0 : Math.ceil(Number.parseFloat(index));
        return this.indexedArray.slice(arrayIndex + offset, arrayIndex + offset + limit);
      },
      ...defaultChunksArrayOptions,
      ...chunksArrayOptions,
    });
  }

  destroy() {
    this.#chunksArray?.destroy();
    this.#sourceArrayObserver?.destroy();
  }
}

export class IndexedItem {
  constructor(item, index) {
    this.index = index;
    this.item = item;
  }
}
