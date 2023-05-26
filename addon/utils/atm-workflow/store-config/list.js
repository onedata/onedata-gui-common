/**
 * Contains types, data and function related to "list" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

/**
 * @typedef {Object} AtmListStoreConfig
 * @property {AtmDataSpec} itemDataSpec
 */

/**
 * @param {AtmListStoreConfig} storeConfig
 * @returns {AtmDataSpec | null}
 */
export function getDefaultValueDataSpec(storeConfig) {
  if (!storeConfig?.itemDataSpec) {
    return null;
  }

  return {
    type: AtmDataSpecType.Array,
    itemDataSpec: storeConfig.itemDataSpec,
  };
}

/**
 * @param {AtmListStoreConfig} [storeConfig]
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getReadDataSpecFilters(storeConfig) {
  const filters = [];

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
 * @param {AtmListStoreConfig} [storeConfig]
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getWriteDataSpecFilters(storeConfig) {
  const filters = [];

  const itemDataSpec = storeConfig && storeConfig.itemDataSpec;
  if (itemDataSpec) {
    filters.push({
      filterType: 'typeOrSubtype',
      types: [itemDataSpec, {
        type: 'array',
        itemDataSpec,
      }],
    });
  }

  return filters;
}

export default {
  getDefaultValueDataSpec,
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
