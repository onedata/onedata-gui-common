/**
 * Shows audit log entries in a form of infinite table. Functionality:
 * - shows formatted timestamp by default (see `isTimestampRoundedToSeconds`
 *   to customize format),
 * - can show severity (to turn this on, see `isSeverityColumnVisible`),
 * - assigns classes to each table entry depending on log entry severity.
 *   That applies specific background colors for each severity level.
 * - allows to provide custom classes for each log entry
 *   (see `onGetClassNamesForLogEntry`).
 * - allows to specify custom table columns. `customColumnHeaders` is responsible
 *   for defining column headers, whereas in component's yield section you can
 *   specify hbs which will consume `logEntry` and transform it into table cells.
 *   By default this component provides only two columns - timestamp and severity.
 * - shows log entry details inside sliding mini-window
 *   (see `doesOpenDetailsOnClick` to turn this on).
 * - allows to customize texts (see `noLogEntriesText`, `title`, `titleTip`,
 *   `titleTipClassName`).
 *
 * # WHAT EXACTLY IS AUDIT LOG?
 *
 * See documentation in utils/audit-log.js
 *
 * # HOW TO USE
 *
 * Typical usage of this component starts with defining it's hbs invocation:
 * ```
 * {{#audit-log-browser
 *   onFetchLogEntries=fetchLogEntriesCallback
 *   customColumnHeaders=customColumnHeaders
 *   title=(tt this "auditLogTitle")
 *   titleTip=(tt this "auditLogTitleTip")
 *   as |logEntry|
 * }}
 *   <td class="description-cell">{{or logEntry.content.description "—"}}</td>
 * {{/audit-log-browser}}
 * ```
 * Of course you can use any of the flags marked as `@virtual` in this component,
 * but presented example is a very typical setup.
 *
 * The next step is to define `fetchLogEntriesCallback` and `customColumnHeaders`.
 * - `fetchLogEntriesCallback` is a callback which accepts listing parameters and
 *   should return a promise with log entries page. NOTE: that page should be normalized
 *   before usage in case of some API changes or backend errors - see
 *   `normalizeEntriesPage` in utils/audit-log.js.
 * - `customColumnHeaders` is an array of column header definitions and in our example
 *   might look like this:
 *   ```
 *   customColumnHeaders: computed(function customColumnHeaders() {
 *     return [{
 *       classNames: 'description-column-header',
 *       content: this.t('columnLabels.description'),
 *     }];
 *   }),
 *   ```
 *
 * The last step is to adjust both the parent component and the audit log browser
 * styles so that the browser fills up all available space of the parent in a way
 * suitable for infinite scroll. It can be achived e.g. using flexbox or grid layout.
 *
 * ## HOW TO APPLY CUSTOM STYLES TO EACH ENTRY
 *
 * If you want to apply custom CSS classes to each entry row, you can pass
 * your custom implementation of `onGetClassNamesForLogEntry`. It gets a log entry
 * as an argument and should return a string with class names.
 *
 * To make the styling process easier there are some predefined CSS classes
 * that you can use:
 * - `audit-log-theme-none` - no entry theming (like for "info" log),
 * - `audit-log-theme-default` - blue entry theme (like for "debug" log),
 * - `audit-log-theme-warning` - yellow entry theme (like for "warning" log),
 * - `audit-log-theme-danger` - red entry theme (like for "error" log),
 * - `audit-log-theme-success` - green entry theme.
 * All of these css classes alter both background and severity icon color.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { ListingDirection } from 'onedata-gui-common/utils/audit-log';
import layout from 'onedata-gui-common/templates/components/audit-log-browser';

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
   * Should fetch audit log entries page according to the passed parameters.
   * This component parameter is essential - without it the audit log browser
   * is not functional.
   * @virtual
   * @type {(listingParams: AuditLogListingParams) => Promise<AuditLogEntriesPage>}
   */
  onFetchLogEntries: undefined,

  /**
   * Name of component to render as `log-entry-details` sliding panel.
   * By default it uses component with raw log entry presenter.
   * @virtual optional
   * @type {string}
   */
  logEntryDetailsComponentName: 'audit-log-browser/log-entry-details',

  /**
   * Returns class names for each log entry. These classes are then applied to
   * the corresponding table row.
   * @virtual optional
   * @type {(logEntry: AuditLogEntry) => string}
   */
  onGetClassNamesForLogEntry: () => '',

  /**
   * When false, renders the timestamp including milliseconds. When true,
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

  /**
   * A custom text visible when there are no log entries to show. When not provided,
   * the default one will be used.
   * @virtual optional
   * @type {SafeString}
   */
  noLogEntriesText: undefined,

  /**
   * A text shown above the table and working as a title.
   * @virtual optional
   * @type {SafeString}
   */
  title: undefined,

  /**
   * A text shown inside table title's tooltip.
   * @virtual optional
   * @type {SafeString}
   */
  titleTip: undefined,

  /**
   * Additional class that should be added to the rendered title tooltip.
   * @virtual optional
   * @type {string}
   */
  titleTipClassName: undefined,

  /**
   * When true, opens details view on log entry click.
   * @virtual optional
   * @type {boolean}
   */
  doesOpenDetailsOnClick: false,

  /**
   * @type {InfiniteScrollTableUpdateStrategy}
   */
  updateStrategy: 'onTop',

  /**
   * Extra data provided to configure default log-entry-details view.
   * May be overriden if custom log entry details component is used.
   * @type {any}
   */
  logEntryDetailsModel: computed(
    'isTimestampRoundedToSeconds',
    function logEntryDetailsModel() {
      return { isTimestampRoundedToSeconds: this.isTimestampRoundedToSeconds };
    }
  ),

  /**
   * `onFetchLogEntries` adjusted to be compatible with infinite-scroll-table
   * component's `onFetchEntries` parameter format.
   * @type {ComputedProperty<(listingParams: InfiniteScrollListingParams) => Promise<InfiniteScrollEntriesPage>>}
   */
  onFetchEntries: computed('onFetchLogEntries', function onFetchEntries() {
    return async (listingParams) => {
      if (!this.onFetchLogEntries) {
        return {
          entries: [],
          isLast: true,
        };
      }

      const results = await this.onFetchLogEntries({
        ...listingParams,
        direction: ListingDirection.BackwardFromNewest,
      });

      return {
        entries: results?.logEntries ?? [],
        isLast: results?.isLast ?? true,
      };
    };
  }),

  /**
   * @type {ComputedProperty<number>}
   */
  columnsCount: computed(
    'isSeverityColumnVisible',
    'customColumnHeaders',
    function columnsCount() {
      const {
        isSeverityColumnVisible,
        customColumnHeaders,
      } = this.getProperties('isSeverityColumnVisible', 'customColumnHeaders');

      // 1 (timestamp) + 0 or 1 (optional severity) + custom columns count
      return 1 +
        (isSeverityColumnVisible ? 1 : 0) +
        (customColumnHeaders?.length || 0);
    }
  ),
});
