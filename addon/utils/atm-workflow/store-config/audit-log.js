/**
 * Contains types, data and function related to "audit log" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmAuditLogStoreConfig
 * @property {AtmDataSpec} logContentDataSpec
 */

/**
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getReadDataSpecFilters() {
  return [{
    filterType: 'typeOrSupertype',
    types: [{ type: 'object' }],
  }];
}

/**
 * @param {AtmListStoreConfig} [storeConfig]
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getWriteDataSpecFilters(storeConfig) {
  const filters = [];

  const logContentDataSpec = storeConfig && storeConfig.logContentDataSpec;
  if (logContentDataSpec) {
    filters.push({
      filterType: 'typeOrSubtype',
      types: [logContentDataSpec, {
        type: 'array',
        valueConstraints: {
          itemDataSpec: logContentDataSpec,
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
