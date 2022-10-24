/**
 * Contains data related to "time series" automation stores.
 *
 * @module utils/atm-workflow/store-config/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmTimeSeriesStoreConfig
 * @property {TimeSeriesCollectionSchema} timeSeriesCollectionSchema
 * @property {{ rootSection: OneTimeSeriesChartsSectionSpec }} [dashboardSpec]
 */

/**
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getReadDataSpecFilters() {
  return [{
    filterType: 'typeOrSupertype',
    types: [{ type: 'timeSeriesMeasurement' }],
  }];
}

/**
 * @returns {Array<AtmDataSpecFilter>}
 */
export function getWriteDataSpecFilters() {
  return [{
    filterType: 'typeOrSubtype',
    types: [{ type: 'timeSeriesMeasurement' }],
  }];
}

export default {
  getReadDataSpecFilters,
  getWriteDataSpecFilters,
};
