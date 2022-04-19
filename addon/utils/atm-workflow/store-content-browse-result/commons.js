/**
 * Contains typedefs reused between various types of automation stores content browse results.
 *
 * @module utils/atm-workflow/store-content-browse-result/commons
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmInfiniteLogStoreContainerEntryBase
 * @property {string} index
 */

/**
 * @typedef {AtmInfiniteLogStoreContainerEntryBase} AtmInfiniteLogStoreContainerSuccessfulEntry<T>
 * @property {true} success
 * @property {T} value
 */

/**
 * @typedef {AtmAuditLogStoreResultEntryBase} AtmInfiniteLogStoreContainerFailedEntry
 * @property {false} success
 * @property {Object} error
 */

/**
 * @typedef {
 *   AtmInfiniteLogStoreContainerSuccessfulEntry<T> |
 *   AtmInfiniteLogStoreContainerFailedEntry
 * } AtmInfiniteLogStoreContainerEntry<T>
 */
