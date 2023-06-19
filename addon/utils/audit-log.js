/**
 * Typedefs, enums and functions related to audit log functionality.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { assert } from '@ember/debug';
import _ from 'lodash';

/**
 * # WHAT IS AN AUDIT LOG
 *
 * An audit log is a (possible infinite) list of log entries persisted in the backend.
 * Each log entry describes some event in the past, which means that existing log entries
 * does not change through time.
 *
 * To read about log entry structure, see at `AuditLogEntry` type.
 *
 * There are multiple possible audit logs available, each of which is very similar
 * in terms of the format and differs only in `content` field and a way
 * how it is available through API.
 *
 * # HOW TO ACCESS AN AUDIT LOG
 *
 * An audit log is available through the backend endpoints specific for each use case.
 * Log entries listing params (`AuditLogListingParams`) should be the same across all
 * of them. To read more about possible listing params, see at
 * `AuditLogListingParams` type.
 *
 * The listing request should return an object of type `AuditLogEntriesPage`
 * which contains an array of log entries and a flag describing whether or not
 * it is the end of the audit log.
 *
 * ## NOTE ABOUT AUDIT LOG ENTRIES SORTING
 *
 * It is not guaranteed that log entries will always be properly sorted by timestamp.
 * In some situations a couple of log entriess can flip its position in the audit log
 * because new entries can be only appended to the end of the list and log entries are
 * not always received by the backend mechanisms in the chronological order.
 * It should not be the case for the log entries generated by Onedata system itself,
 * but can happen, when log entries are acquired from some external system (like
 * Kubernetes events).
 */

/**
 * @typedef {Object} AuditLogListingParams
 * @property {string|null} [index] an anchor where the listing should start.
 *   Only one of `index` and `timestamp` fields should be provided during
 *   the listing. Every log entry received from the backend has that field
 *   so it is ease to start from the specific log entry.
 * @property {number|null} [timestamp] a timestamp specifying from which log
 *   entry listing should start. Only one of `index` and `timestamp` fields
 *   should be provided during the listing.
 * @property {number} [limit] how many log entries should be fetched
 * @property {number} [offset] says where the listing should start relative to
 *   the provided `index`|`timestamp`. Default is 0 which means that the
 *   specified log entry will be the first one in the results. When negative
 *   integer is provided, the listing will start before specified log entry.
 *   When it is a positive integer, it will omit that number of entries during
 *   the listing.
 * @property {AuditLogListingDirection} [direction] describes in what direction
 *   (from which end of the audit log) should the log entries be listed.
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
 * @param {unknown} page should be an `AuditLogEntriesPage`-like object
 * @param {((content: unknown) => T)|undefined} [normalizeEntryContent]
 * Callback responsible for normalizing system log entries content. When not provided,
 * content will be "normalized as is" without changes.
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
 * @property {string} index Some unique string index used to reference entries
 *   during the listing.
 * @property {number} timestamp the time of log entry occurrence in milliseconds.
 *   Due to the persistence/data synchronization delays it might be a bit
 *   different than the real "physical" occurence time.
 * @property {AuditLogEntrySeverity} severity describes severity level of
 *   the log entry.
 */

/**
 * @typedef {AuditLogEntryBase} AuditLogSystemEntry<T> Single system audit log entry.
 * @property {'system'} source describes the origin of the log entry.
 *   `'system'` means "genereted by Onedata itself or by some external service"
 * @property {T} content content of the log entry. When `source` is `'system'`,
 *   then it is in a format specific for each use case, e.g. all recall
 *   log entries will share the same type for `content` field.
 */

/**
 * @typedef {AuditLogEntryBase} AuditLogUserEntry Single user audit log entry.
 * @property {'user'} source describes the origin of the log entry.
 *   `'system'` means "provided by user, fully custom"
 * @property {unknown} content content of the log entry. When `source` is `'user'`
 *   then content does not have any specific type and can be any valid JSON.
 */

/**
 * @typedef {AuditLogSystemEntry<T> | AuditLogUserEntry} AuditLogEntry<T>
 */

/**
 * @param {unknown} entry should be an `AuditLogEntry`-like object
 * @param {((content: unknown) => T)|undefined} [normalizeContent] Callback
 *   responsible for normalizing system log entries content. When not provided,
 *   content will be "normalized as is" without changes.
 * @returns {AuditLogEntry<T>|null}
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
  if (
    normalizedSource === EntrySource.System &&
    typeof normalizeContent === 'function'
  ) {
    normalizedContent = normalizeContent(entry.content);
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
 * @type {AuditLogEntrySource}
 */
export const defaultEntrySource = EntrySource.System;

/**
 * Returns passed entry source if it is a valid one, `defaultEntrySeverity` otherwise.
 * @param {unknown} source should be an `AuditLogEntrySource`-like string
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
 * @type {Array<AuditLogEntrySeverity>}
 */
export const entrySeveritiesArray = Object.freeze([
  EntrySeverity.Debug,
  EntrySeverity.Info,
  EntrySeverity.Notice,
  EntrySeverity.Warning,
  EntrySeverity.Alert,
  EntrySeverity.Error,
  EntrySeverity.Critical,
  EntrySeverity.Emergency,
]);

assert(
  '`entrySeveritiesArray` should have the same values as `EntrySeverity` does.',
  _.isEqual(Object.values(EntrySeverity).sort(), [...entrySeveritiesArray].sort())
);

/**
 * The most common severity level, which can be used as a default one and as
 * a fallback when the severity is unknown.
 * @type {AuditLogEntrySeverity}
 */
export const defaultEntrySeverity = EntrySeverity.Info;

/**
 * Returns passed severity if it is a valid one, `defaultEntrySeverity` otherwise.
 * @param {unknown} severity should be an `AuditLogEntrySeverity`-like string
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
  if (!i18n) {
    console.error('utils/audit-log:translateEntrySeverity: i18n is undefined');
    return '';
  }

  const i18nKey = `${i18nPrefix}.entrySeverities.${severity}`;
  return i18n.t(i18nKey) || '';
}
