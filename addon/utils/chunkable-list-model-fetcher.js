/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import { tracked } from '@glimmer/tracking';
import { defaultAdvancedFilter } from 'onedata-gui-common/components/one-sidebar';
import SidebarBatchProgress from './sidebar-batch-progress';
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
   * @virtual
   * @type {GraphListModel}
   */
  listModel;

  /**
   * @virtual
   * @type {BatchRequestRegistryService}
   */
  batchRequestRegistry;

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

    this.listModel = listModel;

    this.batchRequestRegistry = batchRequestRegistry;

    /** @type {SidebarBatchProgress} */
    this.batchProgress;
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

  /**
   * Returns native sorted array with all records loaded.
   * @returns {Promise<Array<ChunkableListModelFetcherItem>>}
   */
  async getPreparedList() {
    const itemsGris = this.listModel.belongsTo('list').ids();
    // FIXME: to chyba już w tym momencie trzeba utworzyć kontenery
    // bo niewykluczone, że await ...list.toArray() spowoduje dociąganie od razu
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
    try {
      // FIXME: sprawdzić czy tutaj występuje fetch
      const recordsProxy = this.listModel.list;
      // FIXME: na razie nie jest dokładne - granulacja liczbami kontenerów, można to poprawić wystawiając size konetenera na zewnątrz
      this.batchProgress = new SidebarBatchProgress(containers.length);
      for (const container of containers) {
        try {
          await container.flush();
        } finally {
          this.batchRequestRegistry.destroyContainer(container);
        }
        this.batchProgress += 1;
      }
      const staticList = await allFulfilled((await recordsProxy).toArray());
      const sortedStaticList = _.sortBy(staticList, this.listSortKey);
      return sortedStaticList;

    } finally {
      for (const container of containers) {
        this.batchRequestRegistry.destroyContainer(container);
      }
    }
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
