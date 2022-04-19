/**
 * Contains typedefs related to "single value" automation stores content browse result.
 *
 * @module utils/atm-workflow/store-content-browse-result/single-value
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {
 *   AtmSingleValueStoreContentBrowseSuccessfulResult |
 *   AtmSingleValueStoreContentBrowseFailedResult
 * } AtmSingleValueStoreContentBrowseResult
 */

/**
 * @typedef {Object} AtmSingleValueStoreContentBrowseSuccessfulResult
 * @property {true} success
 * @property {unknown} value
 */

/**
 * @typedef {Object} AtmSingleValueStoreContentBrowseFailedResult
 * @property {false} success
 * @property {Object} error
 */
