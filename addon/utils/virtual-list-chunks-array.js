/**
 * FIXME: doc; opakowanie na ListModel (model) -> VirtualListFetcher (view model) -> ChunksArray (view) <- VirtualListReloader
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VirtualListFetcher from './virtual-list-fetcher';
import ReplacingChunksArray from './replacing-chunks-array';
import VirtualListReloader from './virtual-list-reloader';

export default class VirtualListChunksArray {
  /** @type {GraphListModel} */
  listModel = undefined;

  /** @type {ReplacingChunksArray} */
  chunksArray = undefined;

  /** @type {VirtualListFetcher} */
  virtualListFetcher = undefined;

  /** @type {VirtualListReloader} */
  virtualListReloader = undefined;

  constructor(listModel, chunksArrayOptions) {
    this.listModel = listModel;
    this.virtualListFetcher = new VirtualListFetcher(listModel);
    this.chunksArray = ReplacingChunksArray.create({
      fetch: (index, limit, offset) => {
        return this.virtualListFetcher.fetch(index, limit, offset);
      },
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
      ...chunksArrayOptions,
    });
    this.virtualListReloader = VirtualListReloader.create({
      listModel,
      chunksArray: this.chunksArray,
    });
  }

  destroy() {
    this.virtualListReloader?.destroy();
    this.chunksArray?.destroy();
  }

  setFilter(expression) {
    this.virtualListFetcher.setFilter(expression);
    this.virtualListReloader.handleListChange();
  }
}
