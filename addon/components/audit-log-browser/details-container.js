import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../../templates/components/audit-log-browser/details-container';

export default Component.extend(I18n, {
  layout,
  classNames: ['details-container'],
  classNameBindings: ['logEntry:visible'],

  i18n: service(),
  globalClipboard: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.auditLogBrowser.detailsContainer',

  /**
   * @virtual
   * @type {AuditLogEntry|undefined}
   */
  logEntry: undefined,

  /**
   * @type {AuditLogEntry}
   */
  latestLogEntry: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onClose: undefined,

  /**
   * When false, renders the timestamp including milliseconds. When true,
   * rounds the timestamp to seconds and hides milliseconds during rendering.
   * @virtual optional
   * @type {boolean}
   */
  isTimestampRoundedToSeconds: false,

  /**
   * Timestamp in log entry is in milliseconds and we need to convert it to
   * seconds, because that is how `date-format` helper interprets passed timestamp.
   * @type {ComputedProperty<number>}
   */
  timestampInSeconds: computed(
    'latestLogEntry.timestamp',
    function timestampInSeconds() {
      return this.get('latestLogEntry.timestamp') / 1000;
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  stringifiedLogEntry: computed('latestLogEntry', function stringifiedLogEntry() {
    const latestLogEntry = this.get('latestLogEntry');
    return JSON.stringify(latestLogEntry, function replacer(key, value) {
      // Remove "id" property, because it is added by the infinite scroll mechanism
      if (this === latestLogEntry && key === 'id') {
        return undefined;
      }
      return value;
    }, 2);
  }),

  logEntryObserver: observer('logEntry', function logEntryObserver() {
    const logEntry = this.get('logEntry');
    if (logEntry) {
      this.set('latestLogEntry', logEntry);
    }
  }),

  actions: {
    copyJson() {
      const {
        globalClipboard,
        stringifiedLogEntry,
      } = this.getProperties('globalClipboard', 'stringifiedLogEntry');

      globalClipboard.copy(stringifiedLogEntry, this.t('copyJsonAckType'));
    },
  },
});
