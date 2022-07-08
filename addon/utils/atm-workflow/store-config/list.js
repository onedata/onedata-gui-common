/**
 * Contains types, data and function related to "list" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { commonDataSpecFilters } from './commons';

/**
 * @typedef {Object} AtmListStoreConfig
 * @property {AtmDataSpec} itemDataSpec
 */

/**
 * @param {AtmListStoreConfig} [storeConfig]
 * @returns {Array<DataSpecEditorFilter>}
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
 * @param {AtmListStoreConfig} [storeConfig]
 * @returns {Array<DataSpecEditorFilter>}
 */
export function getWriteDataSpecFilters(storeConfig) {
  const filters = [...commonDataSpecFilters];

  const itemDataSpec = storeConfig && storeConfig.itemDataSpec;
  if (itemDataSpec) {
    filters.push({
      filterType: 'typeOrSubtype',
      types: [itemDataSpec, {
        type: 'array',
        valueConstraints: {
          itemDataSpec,
        },
      }],
    });
  }

  return filters;
}

export default {
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
