/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import { tracked } from '@glimmer/tracking';
import { defaultAdvancedFilter } from 'onedata-gui-common/components/one-sidebar';

/**
 * @typedef {InfiniteScrollItem} ChunkableListModelFetcherItem
 */

export default class VirtualListFetcher {
  listSortKey = 'index';

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
  listModel = undefined;

  constructor(listModel) {
    this.listModel = listModel;
  }

  /**
   * @param {InfiniteScrollIndex} index
   * @param {InfiniteScrollLimit} limit
   * @param {InfiniteScrollOffset} offset
   * @returns {InfiniteScrollPage}
   */
  async fetch(index, limit, offset) {
    const list = this.filterItems(await this.getPreparedList());
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
    const list = await this.listModel.list;
    let staticList = await allFulfilled(list.toArray());
    staticList = _.sortBy(staticList, this.listSortKey);
    return staticList;
  }

  setFilter({ expression, advanced }) {
    this.filterExpression = expression;
    this.filterAdvanced = advanced;
  }

  filterItems(items) {
    const itemsByExpression = this.filterByExpression(items);
    if (this.filterAdvanced) {
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
