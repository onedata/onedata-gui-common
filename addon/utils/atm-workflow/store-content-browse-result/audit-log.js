/**
 * Contains typedefs related to "audit log" automation stores content browse result.
 *
 * @module utils/atm-workflow/store-content-browse-result/audit-log
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} AtmAuditLogStoreContentBrowseResult
 * @property {Array<AtmInfiniteLogStoreContainerEntry<AtmAuditLogStoreResultEntryValue>>} logs
 * @property {boolean} isLast
 */

/**
 * @typedef {AtmAuditLogStoreResultEntryBase} AtmAuditLogStoreResultEntryValue
 * @property {number} timestamp
 * @property {unknown} content
 * @property {AtmAuditLogStoreResultEntrySeverity} severity
 */

/**
 * @typedef {'debug'|'info'|'notice'|'warning'|'alert'|'error'|'critical'|'emergency'} AtmAuditLogStoreResultEntrySeverity
 */
