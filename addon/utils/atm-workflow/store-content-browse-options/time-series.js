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
 * @typedef {TimeSeriesCollectionSliceQueryParams} AtmTimeSeriesStoreSliceContentBrowseOptions
 * @property {'timeSeriesStoreContentBrowseOptions'} type
 * @property {'slice'} mode
 */

export const browseModes = {
  layout: 'layout',
  slice: 'slice',
};
