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
import _ from 'lodash';

// FIXME: nazwa może sugerować, że to jest implementacja ChunksArraya
export default class VirtualListChunksArray {
  /** @type {typeof VirtualListFetcher} */
  get VirtualListFetcherClass() {
    return VirtualListFetcher;
  }

  get filterExpression() {
    return this.virtualListFetcher.filterExpression;
  }

  get filterAdvanced() {
    return this.virtualListFetcher.filterAdvanced;
  }

  constructor(listModel, chunksArrayOptions) {

    /** @type {GraphListModel} */
    this.listModel = listModel;

    /** @type {VirtualListFetcher} */
    this.virtualListFetcher = new this.VirtualListFetcherClass(listModel);

    /** @type {ReplacingChunksArray} */
    this.chunksArray = ReplacingChunksArray.create({
      fetch: (index, limit, offset) => {
        return this.virtualListFetcher.fetch(index, limit, offset);
      },
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
      ...chunksArrayOptions,
    });

    /** @type {VirtualListReloader} */
    this.virtualListReloader = VirtualListReloader.create({
      listModel,
      chunksArray: this.chunksArray,
    });
  }

  destroy() {
    this.virtualListReloader?.destroy();
    this.chunksArray?.destroy();
  }

  setFilter({ expression, advanced }) {
    if (
      this.filterExpression === expression &&
      _.isEqual(this.filterAdvanced, advanced)
    ) {
      return;
    }
    this.virtualListFetcher.setFilter({ expression, advanced });
    this.virtualListReloader.handleListChange();
  }
}
