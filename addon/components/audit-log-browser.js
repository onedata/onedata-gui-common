import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/audit-log-browser';
import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * @typedef {Object} AuditLogBrowserCustomColumnHeader
 * @property {SafeString} content
 * @property {string} classNames
 */

export default Component.extend(I18n, {
  layout,
  classNames: ['audit-log-browser'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.auditLogBrowser',

  /**
   * @virtual
   * @type {(listingParams: AuditLogListingParams) => Promise<AuditLogEntriesPage>}
   */
  onFetchEntries: undefined,

  /**
   * Returns class names for each log entry. These classes are the applied to
   * the corresponding table row.
   * @virtual optional
   * @type {(entry: AuditLogEntry) => string}
   */
  onGetClassNamesForEntry: () => '',

  /**
   * When false, renders the timestamp including milliseconds. When false,
   * rounds the timestamp to seconds and hides milliseconds during rendering.
   * @virtual optional
   * @type {boolean}
   */
  isTimestampRoundedToSeconds: false,

  /**
   * When false, does not render severity column. In that case severity
   * is only visible via entries style.
   * @virtual optional
   * @type {boolean}
   */
  isSeverityColumnVisible: false,

  /**
   * An array of header specifications of custom (additional) table columns.
   * @virtual optional
   * @type {Array<AuditLogBrowserCustomColumnHeader>|undefined}
   */
  customColumnHeaders: undefined,
});
