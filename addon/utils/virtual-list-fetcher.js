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

/**
 * @typedef {Object} VirtualListFetcherItem
 * @property {string} index
 */

export default class VirtualListFetcher {
  listSortKey = 'index';

  /**
   * @type {string}
   */
  filterExpression = '';

  /**
   * @virtual
   * @type {GraphListModel}
   */
  listModel = undefined;

  constructor(listModel) {
    this.listModel = listModel;
  }

  // FIXME: returns type infinite scroll page
  /**
   * @param {string|null} index
   * @param {number} limit
   * @param {number} offset
   * @returns {{ array, isLast }}
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
   * @returns {Promise<Array<VirtualListFetcherItem>>}
   */
  async getPreparedList() {
    const list = await this.listModel.list;
    let staticList = await allFulfilled(list.toArray());
    staticList = _.sortBy(staticList, this.listSortKey);
    return staticList;
  }

  setFilter(expression) {
    this.filterExpression = expression;
  }

  filterItems(items) {
    if (!this.filterExpression) {
      return items;
    }
    const queryRegExp = new RegExp(this.filterExpression, 'i');
    return items.filter(item => queryRegExp.test(item.name));
  }
}
