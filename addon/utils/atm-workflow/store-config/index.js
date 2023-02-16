/**
 * Contains types, data and function related to "list" automation store.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getProperties } from '@ember/object';
import { isAtmDataSpecMatchingFilters } from 'onedata-gui-common/utils/atm-workflow/data-spec/filters';
import auditLog from './audit-log';
import list from './list';
import range from './range';
import singleValue from './single-value';
import timeSeries from './time-series';
import treeForest from './tree-forest';

export const stores = {
  auditLog,
  list,
  range,
  singleValue,
  timeSeries,
  treeForest,
};

/**
 * Returns data spec describing type of store default value.
 *
 * @param {Object} store
 * @returns {AtmDataSpec|null}
 */
export function getDataSpecForStoreDefaultValue(store) {
  const storeType = store?.type;
  return stores[storeType]?.getDefaultValueDataSpec?.(store?.config) ?? null;
}

/**
 * Returns true when given store type can have a default value.
 *
 * @param {string} storeType
 * @returns {boolean}
 */
export function canStoreTypeHaveDefaultValue(storeType) {
  return Boolean(stores[storeType]?.getDefaultValueDataSpec);
}

/**
 * Returns true when values read from the passed `store` are compatbile with
 * `readDataSpec`.
 *
 * @param {AtmDataSpec} readDataSpec
 * @param {Object} store
 * @returns {boolean}
 */
export function doesDataSpecFitToStoreRead(readDataSpec, store) {
  if (!readDataSpec || !store) {
    return false;
  }

  const {
    type: storeType,
    config: storeConfig,
  } = getProperties(store, 'type', 'config');
  const dataSpecFilters = getStoreTypeReadDataSpecFilters(storeType, storeConfig);

  return isAtmDataSpecMatchingFilters(readDataSpec, dataSpecFilters);
}

/**
 * Returns true when values compatible with `writeDataSpec` can be saved to the
 * passed `store`.
 *
 * @param {AtmDataSpec} writeDataSpec
 * @param {Object} store
 * @returns {boolean}
 */
export function doesDataSpecFitToStoreWrite(writeDataSpec, store) {
  if (!writeDataSpec || !store) {
    return false;
  }

  const {
    type: storeType,
    config: storeConfig,
  } = getProperties(store, 'type', 'config');
  const dataSpecFilters = getStoreTypeWriteDataSpecFilters(storeType, storeConfig);

  return isAtmDataSpecMatchingFilters(writeDataSpec, dataSpecFilters);
}

/**
 * @param {string} storeType
 * @param {Object} storeConfig
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getStoreTypeReadDataSpecFilters(storeType, storeConfig) {
  if (!(storeType in stores) || !stores[storeType].getReadDataSpecFilters) {
    return [];
  }

  return stores[storeType].getReadDataSpecFilters(storeConfig);
}

/**
 * @param {string} storeType
 * @param {Object} storeConfig
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getStoreTypeWriteDataSpecFilters(storeType, storeConfig) {
  if (!(storeType in stores) || !stores[storeType].getWriteDataSpecFilters) {
    return [];
  }

  return stores[storeType].getWriteDataSpecFilters(storeConfig);
}
