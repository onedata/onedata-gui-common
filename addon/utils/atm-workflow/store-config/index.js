import { getProperties } from '@ember/object';
import dataSpecMatchesFilters from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/data-spec-matches-filters';
import auditLog from './audit-log';
import list from './list';
import range from './range';
import singleValue from './single-value';
import timeSeries from './time-series';
import treeForest from './tree-forest';

const stores = {
  auditLog,
  list,
  range,
  singleValue,
  timeSeries,
  treeForest,
};

export function doesDataSpecFitToStoreRead(readDataSpec, store) {
  if (!readDataSpec || !store) {
    return false;
  }

  const {
    type: storeType,
    config: storeConfig,
  } = getProperties(store, 'type', 'config');
  const dataSpecFilters = getStoreTypeReadDataSpecFilters(storeType, storeConfig);

  return dataSpecMatchesFilters(readDataSpec, dataSpecFilters);
}

export function doesDataSpecFitToStoreWrite(writeDataSpec, store) {
  if (!writeDataSpec || !store) {
    return false;
  }

  const {
    type: storeType,
    config: storeConfig,
  } = getProperties(store, 'type', 'config');
  const dataSpecFilters = getStoreTypeWriteDataSpecFilters(storeType, storeConfig);

  return dataSpecMatchesFilters(writeDataSpec, dataSpecFilters);
}

function getStoreTypeReadDataSpecFilters(storeType, storeConfig) {
  if (!(storeType in stores) || !stores[storeType].getReadDataSpecFilters) {
    return [];
  }

  return stores[storeType].getReadDataSpecFilters(storeConfig);
}

function getStoreTypeWriteDataSpecFilters(storeType, storeConfig) {
  if (!(storeType in stores) || !stores[storeType].getWriteDataSpecFilters) {
    return [];
  }

  return stores[storeType].getWriteDataSpecFilters(storeConfig);
}
