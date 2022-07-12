/**
 * Contains types, data and function related to "tree forest" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { commonDataSpecFilters } from './commons';

/**
 * @typedef {Object} AtmTreeForestStoreConfig
 * @property {AtmDataSpec} itemDataSpec
 */

/**
 * @param {AtmTreeForestStoreConfig} [storeConfig]
 * @returns {Array<DataSpecFilter>}
 */
export function getReadDataSpecFilters(storeConfig) {
  const filters = [...commonDataSpecFilters];

  const itemDataSpec = storeConfig && storeConfig.itemDataSpec;
  if (itemDataSpec) {
    filters.push({
      filterType: 'typeOrSupertype',
      types: [itemDataSpec],
    });
  } else {
    filters.push({
      filterType: 'typeOrSupertype',
      types: [{ type: 'dataset' }, {
        type: 'file',
        valueConstraints: {
          fileType: 'ANY',
        },
      }],
    });
  }

  return filters;
}

/**
 * @param {AtmTreeForestStoreConfig} [storeConfig]
 * @returns {Array<DataSpecFilter>}
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
  } else {
    filters.push({
      filterType: 'typeOrSubtype',
      types: [{ type: 'dataset' }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: { type: 'dataset' },
        },
      }, {
        type: 'file',
        valueConstraints: {
          fileType: 'ANY',
        },
      }, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: {
            type: 'file',
            valueConstraints: {
              fileType: 'ANY',
            },
          },
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
