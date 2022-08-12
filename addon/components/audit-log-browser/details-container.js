/**
 * Renders details preview of selected log entry `logEntry`. Is visible on screen
 * when `logEntry` is non-empty.
 *
 * Rendered informations and functionalities are:
 * - formatted timestamp,
 * - JSON overview (rendered via ember-ace),
 * - ability to copy JSON to the clipboard.
 *
 * This component does not close by itself. It calls `onClose` when user tries
 * to close it and then (if you want to close it) you should clear `logEntry` value.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/audit-log-browser/details-container';

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
   * Log entry to show details. This component is visible only if `logEntry` is
   * not empty.
   * @virtual
   * @type {AuditLogEntry|undefined}
   */
  logEntry: undefined,

  /**
   * Called when a user tries to close the details. This component does not close
   * itself autonomously - you have to clear `logEntry` property to close it.
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
   * Latest non-empty value of `logEntry`. It is the main source of data to display.
   * Becacuse of that view will always be non-empty even when `logEntry` becomes
   * empty and details view starts to hide.
   * @type {AuditLogEntry|undefined}
   */
  latestLogEntry: undefined,

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
    // Persist `logEntry` in `latestLogEntry`
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
