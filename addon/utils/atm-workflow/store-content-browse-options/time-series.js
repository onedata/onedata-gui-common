/**
 * Contains typedefs related to "time series" automation stores content browse options.
 *
 * @module utils/atm-workflow/store-content-browse-options/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {
 *   AtmTimeSeriesStoreLayoutContentBrowseOptions |
 *   AtmTimeSeriesStoreSliceContentBrowseOptions
 * } AtmTimeSeriesStoreContentBrowseOptions
 */

/**
 * @typedef {Object} AtmTimeSeriesStoreLayoutContentBrowseOptions
 * @property {'timeSeriesStoreContentBrowseOptions'} type
 * @property {'layout'} mode
 */

/**
 * @typedef {Object} AtmTimeSeriesStoreSliceContentBrowseOptions
 * @property {'timeSeriesStoreContentBrowseOptions'} type
 * @property {'slice'} mode
 * @property {Object<string, Array<string>>} layout keys are time series IDs, values
 * are arrays of metric IDs
 * @property {number} [startTimestamp]
 * @property {number} [windowsCount]
 */

export const browseModes = {
  layout: 'layout',
  slice: 'slice',
};
