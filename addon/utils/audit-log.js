/**
 * Typedefs, enums and functions related to audit log functionality.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * WHAT IS AN AUDIT LOG
 *
 * An audit log is a (possible infinite) list of logs persisted in the backend.
 * Each log describes some event in the past, which means that existing logs
 * does not change through time.
 *
 * Every log entry ()`AuditLogEntry`) consists of:
 * - `timestamp` - the time of log occurrence in milliseconds. Due to the
 *   persistence/data synchronization delays it might be a bit diffrent than
 *   the real "physical" occurence time.
 * - `source` - describes the origin of the log. Now there are only two
 *   posibilities here: `'system'` (genereted by Onedata itself or by
 *   some external service) and `'user'` (provided by user, fully custom).
 * - `severity` - describes severity level of the log. For possible values see
 *   `AuditLogEntrySeverity`.
 * - `content` - content of the log. When `source` is `'system'`, then it
 *   is in a format specific for each use case, e.g. all recall logs will share
 *   the same type for `content` field. When `source` is `'user'` then content
 *   does not have any specific type and can be any valid JSON.
 *
 * There are multiple possible audit logs available, each of which is very similar
 * in terms of the format and differs only in `content` field and a way
 * how it is available through API.
 *
 * HOW TO ACCESS AN AUDIT LOG
 *
 * An audit log is available through the backend endpoints specific for each use case.
 * Logs listing params (`AuditLogListingParams`) should be the same across all
 * of them and consists of:
 * - `index`|`timestamp` - an anchor where the listing should start. Only one of these
 *   fields should be provided during the listing. Every log entry received from
 *   the backend has these fields so it is ease to start from the specific log entry.
 * - `limit` - how many log entries should be fetched,
 * - `offset` - where the listing should start relative to the provided
 *   `index`|`timestamp`. Default is 0 which means that the specified log entry
 *   will be the first one in the results. When negative integer is provided,
 *   the listing will start before specified log entry. When it is a positive
 *   integer, it will omit that number of entries during the listing.
 * - `direction` - describe in what direction (from which end of the audit log)
 *   should the log entries be listed. See `AuditLogListingDirection` for
 *   possible values.
 *
 * The listing request should return an object of type `AuditLogEntriesPage`
 * which contains an array of log entries and a flag describing whether or not
 * it is the end of the audit log.
 *
 * NOTE ABOUT AUDIT LOG ENTRIES SORTING
 *
 * It is not guaranteed that log entries will always be properly sorted by timestamp.
 * In some situations a couple of logs can flip its position in the audit log
 * because new entries can be only appended to the end of the list and logs are
 * not always received by the backend mechanisms in the chronological order.
 * Its should not be the case for the logs generated by Onedata system itself,
 * but can happen, when logs are acquired from some external system (like
 * Kubernetes events).
 */

/**
 * @typedef {Object} AuditLogListingParams
 * @property {string|null} index Only one of `index` or `timestamp` can be specified
 * at the same time.
 * @property {number|null} timestamp Only one of `index` or `timestamp` can be specified
 * at the same time.
 * @property {number} limit
 * @property {number} offset
 * @property {AuditLogListingDirection} direction
 */

/**
 * @typedef {'backward_from_newest'|'forward_from_oldest'} AuditLogListingDirection
 */

/**
 * Listing directions in enum format.
 * @type {Object<string, AuditLogListingDirection>}
 */
export const ListingDirection = Object.freeze({
  BackwardFromNewest: 'backward_from_newest',
  ForwardFromOldest: 'forward_from_oldest',
});

/**
 * @typedef {Object} AuditLogEntriesPage<T>
 * @property {Array<AuditLogEntry<T>>} logEntries
 * @property {boolean} isLast
 */

/**
 * @param {unknown} page
 * @param {((content: unknown) => T|null)|undefined} [normalizeEntryContent]
 * @returns {AuditLogEntriesPage<T>}
 */
export function normalizeEntriesPage(page, normalizeEntryContent) {
  const logEntries = Array.isArray(page?.logEntries) ? page.logEntries : [];
  const isLast = typeof page?.isLast === 'boolean' && logEntries.length > 0 ?
    page.isLast : true;

  const normalizedPage = {
    logEntries: logEntries
      .map((entry) => normalizeEntry(entry, normalizeEntryContent))
      .filter(Boolean),
    isLast,
  };

  if (
    logEntries.length !== normalizedPage.logEntries.length &&
    normalizedPage.logEntries.length === 0
  ) {
    // All logs were invalid and we don't know how to perform additional query
    // to fetch another (possibly valid) entries. Hence we have to simulate
    // that this was the last page to stop listing at this point.
    normalizedPage.isLast = true;
  }

  return normalizedPage;
}

/**
 * @typedef {Object} AuditLogEntryBase Base type for a single audit log entry
 * @property {string} index Some unique string index used to reference entries.
 * during the listing
 * @property {number} timestamp Log creation timestamp in milliseconds.
 * @property {AuditLogEntrySeverity} severity Describes log severity level.
 */

/**
 * @typedef {AuditLogEntryBase} AuditLogSystemEntry<T> Single system audit log entry.
 * It contains `content` which format varies depending on specific audit log use case.
 * @property {'system'} source
 * @property {T} content Custom payload, specific for each use case.
 */

/**
 * @typedef {AuditLogEntryBase} AuditLogUserEntry Single system audit log entry.
 * It contains `content` which format unknown (as it is provided by a user).
 * @property {'user'} source
 * @property {unknown} content Custom payload, specific for each use case.
 */

/**
 * @typedef {AuditLogSystemEntry<T> | AuditLogUserEntry} AuditLogEntry<T>
 */

/**
 * @param {unknown} entry
 * @param {((content: unknown) => T|null)|undefined} [normalizeContent]
 * @returns {AuditLogEntry<T>}
 */
export function normalizeEntry(entry, normalizeContent) {
  if (
    typeof entry?.index !== 'string' ||
    typeof entry?.timestamp !== 'number'
  ) {
    return null;
  }

  const normalizedSource = normalizeEntrySource(entry.source);

  let normalizedContent = entry.content;
  if (normalizedSource === EntrySource.System && normalizeContent) {
    normalizedContent = normalizeContent(entry?.content);
  }
  if (normalizedContent === undefined || normalizedContent === null) {
    return null;
  }

  return {
    index: entry.index,
    timestamp: entry.timestamp,
    source: normalizedSource,
    severity: normalizeEntrySeverity(entry.severity),
    content: normalizedContent,
  };
}

/**
 * Describes what entity has created the log entry.
 * @typedef {'system'|'user'} AuditLogEntrySource
 */

/**
 * Sources in enum format
 * @type {Object<string, AuditLogEntrySource>}
 */
export const EntrySource = Object.freeze({
  System: 'system',
  User: 'user',
});

/**
 * The default entry source, which can be used as a fallback when the source
 * is unknown.
 * @type {string}
 */
export const defaultEntrySource = EntrySource.User;

/**
 * Returns passed entry source if it is a valid one, `defaultEntrySeverity` otherwise.
 * @param {unknown} source
 * @returns {AuditLogEntrySource}
 */
export function normalizeEntrySource(source) {
  return Object.values(EntrySource).includes(source) ?
    source : defaultEntrySource;
}

/**
 * @typedef {'debug'|'info'|'notice'|'warning'|'alert'|'error'|'critical'|'emergency'} AuditLogEntrySeverity
 */

/**
 * Severities in enum format.
 * @type {Object<string, AuditLogEntrySeverity>}
 */
export const EntrySeverity = Object.freeze({
  Debug: 'debug',
  Info: 'info',
  Notice: 'notice',
  Warning: 'warning',
  Alert: 'alert',
  Error: 'error',
  Critical: 'critical',
  Emergency: 'emergency',
});

/**
 * The most common severity level, which can be used as a default one and as
 * a fallback when the severity is unknown.
 * @type {string}
 */
export const defaultEntrySeverity = EntrySeverity.Info;

/**
 * Returns passed severity if it is a valid one, `defaultEntrySeverity` otherwise.
 * @param {unknown} severity
 * @returns {AuditLogEntrySeverity}
 */
export function normalizeEntrySeverity(severity) {
  return Object.values(EntrySeverity).includes(severity) ?
    severity : defaultEntrySeverity;
}

/**
 * @type {string}
 */
const i18nPrefix = 'utils.auditLog';

/**
 * @param {Ember.Service} i18n
 * @param {AuditLogEntrySeverity} severity
 * @returns {SafeString}
 */
export function translateEntrySeverity(i18n, severity) {
  const i18nKey = `${i18nPrefix}.entrySeverities.${severity}`;
  return i18n?.t(i18nKey) || '';
}
