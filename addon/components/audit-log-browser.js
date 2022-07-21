import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { not, and } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import { ListingDirection } from 'onedata-gui-common/utils/audit-log';
import layout from '../templates/components/audit-log-browser';

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
  onFetchLogEntries: undefined,

  /**
   * Returns class names for each log entry. These classes are then applied to
   * the corresponding table row.
   * @virtual optional
   * @type {(entry: AuditLogEntry) => string}
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
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
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
});
