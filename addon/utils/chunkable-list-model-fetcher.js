/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { tracked } from '@glimmer/tracking';
import { defaultAdvancedFilter } from 'onedata-gui-common/components/one-sidebar';
import ProgressTracker from './progress-tracker';
import GrisBatchContainerSpec from 'onedata-gui-websocket-client/utils/gris-batch-container-spec';
import { OwsGraphOperation } from 'onedata-gui-websocket-client/services/onedata-graph';
import { DebouncedBatchFlushStrategy } from 'onedata-gui-websocket-client/utils/batch-flush-strategies';

/**
 * @typedef {InfiniteScrollItem} ChunkableListModelFetcherItem
 */

export default class ChunkableListModelFetcher {
  listSortKey = 'index';

  /**
   * How many max items should be fetched in single batch.
   * @type {number}
   */
  batchFetchSize = 100;

  /**
   * @type {ProgressTracker}
   */
  progressTracker = new ProgressTracker();

  /**
   * @type {string}
   */
  @tracked
  filterExpression = '';

  /**
   * @type {any}
   */
  @tracked
  filterAdvanced = defaultAdvancedFilter;

  /**
   * @param {GraphListModel} listModel
   * @param {BatchRequestRegistryService} batchRequestRegistry
   */
  constructor(listModel, batchRequestRegistry) {
    if (!listModel) {
      throw new Error(
        'ChunkableListModelFetcher.constructor: listModel is mandatory'
      );
    }
    if (!batchRequestRegistry) {
      throw new Error(
        'ChunkableListModelFetcher.constructor: batchRequestRegistry is mandatory'
      );
    }

    /** @type {GraphListModel} */
    this.listModel = listModel;

    /** @type {BatchRequestRegistryService} */
    this.batchRequestRegistry = batchRequestRegistry;
  }

  /**
   * @param {InfiniteScrollIndex} index
   * @param {InfiniteScrollLimit} limit
   * @param {InfiniteScrollOffset} offset
   * @returns {InfiniteScrollPage}
   */
  async fetch(index, limit, offset) {
    const completeList = await this.getPreparedList();
    const list = this.filterItems(completeList);
    let recordPos = 0;
    if (index !== null) {
      recordPos = list.findIndex(record => record.index === index);
      if (recordPos === -1) {
        recordPos = 0;
      }
    }
    recordPos += offset;
    recordPos = Math.min(recordPos, list.length);
    recordPos = Math.max(recordPos, 0);
    const array = list.slice(recordPos, recordPos + limit);
    return {
      array,
      isLast: array.length < limit,
    };
  }

  setFilter({ expression, advanced }) {
    this.filterExpression = expression;
    this.filterAdvanced = advanced;
  }

  filterItems(items) {
    const itemsByExpression = this.filterByExpression(items);
    if (this.filterAdvanced && this.filterAdvanced !== defaultAdvancedFilter) {
      return this.filterByAdvancedConditions(itemsByExpression, this.filterAdvanced);
    } else {
      return itemsByExpression;
    }
  }

  /**
   * To be overriden by subclasses if it should have advanced filters.
   * @param {Array<T>} items
   * @param {any} advancedFilter
   * @returns {Array<T>}
   */
  filterByAdvancedConditions(items /*, advancedFilter */ ) {
    return items;
  }

  /**
   * Returns native sorted array with all records loaded.
   * @private
   * @returns {Promise<Array<Object>>}
   */
  async getPreparedList() {
    const itemsGris = this.listModel.belongsTo('list').ids();
    const containers = _.chunk(itemsGris, this.batchFetchSize).map(grisChunk => {
      const containerSpec = new GrisBatchContainerSpec(
        OwsGraphOperation.Get,
        grisChunk
      );
      return this.batchRequestRegistry.createContainer(
        containerSpec,
        DebouncedBatchFlushStrategy
      );
    });
    this.progressTracker.reset(itemsGris.length);
    try {
      const list = this.listModel.list;
      for (const container of containers) {
        const messagesCount = container.messagesCount;
        try {
          await container.flush();
        } finally {
          this.batchRequestRegistry.destroyContainer(container);
        }
        this.progressTracker.doneCount += messagesCount;
      }
      try {
        // Awaiting for list might fail when some single records cannot be fetched,
        // but we can still try to read list afterwards.
        await list;
      } catch {
        console.warn(
          'ChunkableListModelFetcher.getPreparedList: list cannot be fully resolved, some records may be missing'
        );
      }
      // If record cannot be found, it is either not included in the list or it is
      // destroyed.
      const recordsArray = list.filter(r => !r.isDestroyed);
      const sortedStaticList = _.sortBy(recordsArray, this.listSortKey);
      return sortedStaticList;
    } finally {
      for (const container of containers) {
        this.batchRequestRegistry.destroyContainer(container);
      }
    }
  }

  /**
   * @private
   * @param {Array<T>} items
   * @returns {Array<T>}
   */
  filterByExpression(items) {
    if (!this.filterExpression) {
      return items;
    }
    const queryRegExp = new RegExp(this.filterExpression, 'i');
    return items.filter(item => queryRegExp.test(item.name));
  }
}
