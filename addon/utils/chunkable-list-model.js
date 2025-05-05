/**
 * Provides a ReplacingChunksArray interface for list model.
 *
 * Consists of:
 * - `listModel` - the source of list; the list may be updated as any record; must be
 *   provided in constructor,
 * - `chunkableListModelFetcher` - provides `fetch` function that is used by internal
 *   ReplacingChunksArray,
 * - `chunkableListModelReloader` - observes changes in the source list to provide automatic
 *   reloads.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ChunkableListModelFetcher from './chunkable-list-model-fetcher';
import ReplacingChunksArray from './replacing-chunks-array';
import ChunkableListModelReloader from './chunkable-list-model-reloader';
import _ from 'lodash';

export class ChunkableListModel {
  /**
   * Maximum initial size of created chunks array.
   * @type {number}
   */
  initialArraySize = 50;

  /** @type {typeof ChunkableListModelFetcher} */
  get ChunkableListModelFetcherClass() {
    return ChunkableListModelFetcher;
  }

  get filterExpression() {
    return this.chunkableListModelFetcher.filterExpression;
  }

  get filterAdvanced() {
    return this.chunkableListModelFetcher.filterAdvanced;
  }

  /**
   * @type {ProgressTracker|null}
   */
  get progressTracker() {
    return this.chunkableListModelFetcher.progressTracker;
  }

  constructor({ listModel, batchRequestRegistry, chunksArrayOptions }) {
    if (!listModel) {
      throw new Error(
        'ChunkableListModel.constructor: listModel is mandatory'
      );
    }
    if (!batchRequestRegistry) {
      throw new Error(
        'ChunkableListModel.constructor: batchRequestRegistry is mandatory'
      );
    }

    /** @type {GraphListModel} */
    this.listModel = listModel;

    /** @type {ChunkableListModelFetcher} */
    this.chunkableListModelFetcher = new this.ChunkableListModelFetcherClass(
      listModel,
      batchRequestRegistry
    );

    /** @type {ReplacingChunksArray} */
    this.chunksArray = ReplacingChunksArray.create({
      fetch: (index, limit, offset) => {
        return this.chunkableListModelFetcher.fetch(index, limit, offset);
      },
      startIndex: 0,
      endIndex: this.initialArraySize,
      indexMargin: 10,
      // TODO: VFS-12726 Remove chunkSize hack that fixes sidebar jump
      chunkSize: 10,
      reloadMinSize: 24,
      ...chunksArrayOptions,
    });

    /** @type {ChunkableListModelReloader} */
    this.chunkableListModelReloader = ChunkableListModelReloader.create({
      listModel,
      chunksArray: this.chunksArray,
      initialArraySize: this.initialArraySize,
    });
  }

  destroy() {
    this.chunkableListModelReloader?.destroy();
    this.chunksArray?.destroy();
  }

  setFilter({ expression, advanced }) {
    if (
      this.filterExpression === expression &&
      _.isEqual(this.filterAdvanced, advanced)
    ) {
      return;
    }
    this.chunkableListModelFetcher.setFilter({ expression, advanced });
    this.chunkableListModelReloader.handleListChange({ reset: true });
  }
}

export default ChunkableListModel;
