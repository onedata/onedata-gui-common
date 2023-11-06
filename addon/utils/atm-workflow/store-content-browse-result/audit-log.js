/**
 * Contains typedefs related to "audit log" automation stores content browse result.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {AuditLogEntriesPage<AtmAuditLogEntryContent>} AtmAuditLogStoreContentBrowseResult
 */

/**
 * @typedef {Object} AtmAuditLogEntryContent
 * @property {string} description
 * @property {AtmAuditLogEntryReferencedElements} [referencedElements] references to
 * subjects related to this specific log entry
 * @property {Object} [reason] error in the standard backend format
 */

/**
 * @typedef {Object} AtmAuditLogEntryReferencedElements
 * @property {Array<string>} tasks array of task execution IDs
 */
