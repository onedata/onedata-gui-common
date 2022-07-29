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
 *   `titleTipClassNames`).
 *
 * WHAT EXACTLY IS AUDIT LOG?
 *
 * See documentation in utils/audit-log.js
 *
 * HOW TO USE
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
 *
 *   ```
 *
 * The last step is to adjust both the parent component and the audit log browser
 * styles so that the browser fills up all available space of the parent in a way
 * suitable for infinite scroll. It can be achived e.g. using flexbox or grid layout.
 *
 * HOW TO APPLY CUSTOM STYLES TO EACH ENTRY
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
import { computed, observer, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { not, and } from 'ember-awesome-macros';
import { schedule } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import { ListingDirection } from 'onedata-gui-common/utils/audit-log';
import layout from '../templates/components/audit-log-browser';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';

/**
 * @typedef {Object} AuditLogBrowserCustomColumnHeader
 * @property {SafeString} content
 * @property {string} classNames
 */

export default Component.extend(I18n, {
  layout,
  classNames: ['audit-log-browser'],
  classNameBindings: ['selectedLogEntry:shows-details'],

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
   * Additional classes that should be added to the rendered title tooltip.
   * @virtual optional
   * @type {string}
   */
  titleTipClassNames: undefined,

  /**
   * When true, opens details view on log entry click.
   * @virtual optional
   * @type {boolean}
   */
  doesOpenDetailsOnClick: false,

  /**
   * @type {AuditLogEntry|undefined}
   */
  selectedLogEntry: undefined,

  /**
   * True when the top of the audit log table is visible on screen.
   * @type {boolean}
   */
  isTableTopVisible: true,

  /**
   * @type {Utils.InfiniteScroll}
   */
  infiniteScroll: undefined,

  /**
   * @type {Utils.ReplacingChunksArray}
   */
  logEntries: undefined,

  /**
   * @type {ResizeObserver|undefined}
   */
  resizeObserver: undefined,

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

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasNoLogEntries: and('logEntries.initialLoad.isSettled', not('logEntries.length')),

  onFetchLogEntriesObserver: observer(
    'onFetchLogEntries',
    async function onFetchLogEntriesObserver() {
      // Change of `onFetchLogEntries` is treated like a reset of infinite scroll
      // and possible replace of all entries.

      // Deselect currently selected entry (it probably wont be present anymore)
      this.selectLogEntry(undefined);

      // Jump to the beginning of the list (which forces reload)
      await this.get('logEntries').scheduleJump(null);

      // Jump does not scroll directly to the beginning of the table. We have to
      // do it manually.
      schedule('afterRender', this, () => {
        window.requestAnimationFrame(() => {
          safeExec(this, () => {
            const scrollableContainer = this.getScrollableContainer();
            if (scrollableContainer) {
              scrollableContainer.scroll(0, 0);
            }
          });
        });
      });
    }
  ),

  init() {
    this._super(...arguments);

    const logEntries = ReplacingChunksArray.create({
      fetch: this.fetchEntries.bind(this),
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
    const infiniteScroll = InfiniteScroll.create({
      entries: logEntries,
      // height of the row with two lines of text
      singleRowHeight: 50,
      onScroll: this.handleTableScroll.bind(this),
    });
    infiniteScroll.startAutoUpdate();

    this.setProperties({
      logEntries,
      infiniteScroll,
    });
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    const {
      infiniteScroll,
      element,
    } = this.getProperties(
      'infiniteScroll',
      'element',
    );
    infiniteScroll.mount(element.querySelector('.audit-log-table'));
    this.setupResizeObserver();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.teardownResizeObserver();
      this.get('infiniteScroll').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @param {{ headerVisible: boolean }} params
   * @returns {void}
   */
  handleTableScroll({ headerVisible }) {
    const {
      infiniteScroll,
      isTableTopVisible,
    } = this.getProperties('infiniteScroll', 'isTableTopVisible');

    if (!infiniteScroll) {
      return;
    }

    if (isTableTopVisible !== headerVisible) {
      this.set('isTableTopVisible', headerVisible);
    }

    const isAutoUpdating = get(infiniteScroll, 'isAutoUpdating');
    if (headerVisible && !isAutoUpdating) {
      infiniteScroll.startAutoUpdate(true);
    } else if (!headerVisible && isAutoUpdating) {
      infiniteScroll.stopAutoUpdate();
    }
  },

  /**
   * @returns {Promise<{ array: Array<AuditLogEntry & { id: string }>, isLast: boolean }>}
   */
  async fetchEntries(index, limit, offset) {
    const onFetchLogEntries = this.get('onFetchLogEntries');

    const result = onFetchLogEntries ? await onFetchLogEntries({
      index,
      limit,
      offset,
      direction: ListingDirection.BackwardFromNewest,
    }) : {
      logEntries: [],
      isLast: true,
    };

    // Log entries don't have id, which is required by replacing chunks array.
    // Solution: using entry index as id.
    const array = result.logEntries.map((entry) =>
      Object.assign({}, entry, { id: entry.index })
    );

    return {
      array,
      isLast: result.isLast,
    };
  },

  /**
   * Resize observer is responsible for triggering scroll events on each component
   * resize. Without this, the infinite scroll would not have the most current
   * information about visible entries after component resize.
   * @returns {void}
   */
  setupResizeObserver() {
    const scrollableContainer = this.getScrollableContainer();
    // Check whether ResizeObserver API is available
    if (!ResizeObserver || !scrollableContainer) {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      scrollableContainer.dispatchEvent(new Event('scroll'));
    });
    resizeObserver.observe(scrollableContainer);

    this.set('resizeObserver', resizeObserver);
  },

  /**
   * @returns {void}
   */
  teardownResizeObserver() {
    const resizeObserver = this.get('resizeObserver');
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  },

  /**
   * @returns {HTMLDivElement|null}
   */
  getScrollableContainer() {
    return this.get('element')
      ?.querySelector('.audit-log-scrollable-container') || null;
  },

  /**
   * @param {AuditLogEntry|undefined} logEntry
   * @returns {void}
   */
  selectLogEntry(logEntry) {
    const {
      selectedLogEntry,
      doesOpenDetailsOnClick,
    } = this.getProperties('selectedLogEntry', 'doesOpenDetailsOnClick');

    if (!doesOpenDetailsOnClick) {
      return;
    }

    this.set(
      'selectedLogEntry',
      selectedLogEntry?.index === logEntry?.index ? undefined : logEntry
    );
  },

  actions: {
    /**
     * @param {MouseEvent} event
     * @returns {void}
     */
    mainContentClick(event) {
      // Deselect log entry when click occurred outside of any log entry row.
      if (!event.target.closest('.audit-log-table-entry')) {
        this.selectLogEntry(undefined);
      }
    },

    /**
     * @param {AuditLogEntry} logEntry
     * @returns {void}
     */
    logEntryClick(logEntry, event) {
      // Select log entry only when it was the main target for the click action
      // (e.g. was clicked directly, not as a result of nested link/button click).
      if (isDirectlyClicked(event, event.currentTarget)) {
        this.selectLogEntry(logEntry);
      }
    },

    /**
     * @returns {void}
     */
    closeDetails() {
      this.selectLogEntry(undefined);
    },
  },
});
