/**
 * Contains types, data and function related to "audit log" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { commonDataSpecFilters } from './commons';

/**
 * @typedef {Object} AtmAuditLogStoreConfig
 * @property {AtmDataSpec} logContentDataSpec
 */

/**
 * @returns {Array<DataSpecEditorFilter>}
 */
export function getReadDataSpecFilters() {
  return [...commonDataSpecFilters, {
    filterType: 'typeOrSupertype',
    types: [{ type: 'object' }],
  }];
}

/**
 * @param {AtmListStoreConfig} [storeConfig]
 * @returns {Array<DataSpecEditorFilter>}
 */
export function getWriteDataSpecFilters(storeConfig) {
  const filters = [...commonDataSpecFilters];

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
