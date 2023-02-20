/**
 * Contains types, data and function related to "tree forest" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

/**
 * @typedef {Object} AtmTreeForestStoreConfig
 * @property {AtmDataSpec} itemDataSpec
 */

/**
 * @param {AtmTreeForestStoreConfig} storeConfig
 * @returns {AtmDataSpec | null}
 */
export function getDefaultValueDataSpec(storeConfig) {
  if (!storeConfig?.itemDataSpec) {
    return null;
  }

  return {
    type: AtmDataSpecType.Array,
    valueConstraints: {
      itemDataSpec: storeConfig.itemDataSpec,
    },
  };
}

/**
 * @param {AtmTreeForestStoreConfig} [storeConfig]
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
  getDefaultValueDataSpec,
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
