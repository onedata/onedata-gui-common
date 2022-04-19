/**
 * Contains typedefs related to "time series" automation stores content browse result.
 *
 * @module utils/atm-workflow/store-content-browse-result/time-series
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {
 *   AtmTimeSeriesStoreLayoutContentBrowseResult |
 *   AtmTimeSeriesStoreSliceContentBrowseResult
 * } AtmTimeSeriesStoreContentBrowseResult
 */

/**
 * @typedef {Object} AtmTimeSeriesStoreLayoutContentBrowseResult
 * @property {Object<string, Array<string>} layout Keys are time series IDs,
 * values are arrays of metric IDs
 */

/**
 * @typedef {Object} AtmTimeSeriesStoreSliceContentBrowseResult
 * @property {Object<string, Object<string, { timestamp: number, value: number }>>} slice
 * Keys are time series IDs, nested keys are metric IDs, values are arrays of points
 */
