/**
 * Contains types, data and function related to "range" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { commonDataSpecFilters } from './commons';

/**
 * @typedef {Object} AtmRangeStoreConfig
 */

/**
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getReadDataSpecFilters() {
  return [...commonDataSpecFilters, {
    filterType: 'typeOrSupertype',
    types: [{ type: 'range' }],
  }];
}

/**
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getWriteDataSpecFilters() {
  return [...commonDataSpecFilters, {
    filterType: 'typeOrSubtype',
    types: [{ type: 'range' }],
  }];
}

export default {
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
