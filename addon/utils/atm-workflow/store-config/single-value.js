/**
 * Contains types, data and function related to "single value" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { commonDataSpecFilters } from './commons';

/**
 * @typedef {Object} AtmSingleValueStoreConfig
 * @property {AtmDataSpec} itemDataSpec
 */

/**
 * @param {AtmSingleValueStoreConfig} [storeConfig]
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getReadDataSpecFilters(storeConfig) {
  const filters = [...commonDataSpecFilters];

  const itemDataSpec = storeConfig && storeConfig.itemDataSpec;
  if (itemDataSpec) {
    filters.push({
      filterType: 'typeOrSupertype',
      types: [itemDataSpec],
    });
  }

  return filters;
}

/**
 * @param {AtmSingleValueStoreConfig} [storeConfig]
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getWriteDataSpecFilters(storeConfig) {
  const filters = [...commonDataSpecFilters];

  const itemDataSpec = storeConfig && storeConfig.itemDataSpec;
  if (itemDataSpec) {
    filters.push({
      filterType: 'typeOrSubtype',
      types: [itemDataSpec],
    });
  }

  return filters;
}

export default {
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
