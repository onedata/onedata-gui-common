/**
 * Renders details preview of log entry `logEntry`.
 *
 * Rendered informations and functionalities are:
 * - formatted timestamp,
 * - JSON overview (rendered via ember-ace),
 * - ability to copy JSON to the clipboard.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/audit-log-browser/log-entry-details';
import { or, raw } from 'ember-awesome-macros';

/**
 * @typedef {Object} DefaultLogEntryDetailsConfiguration
 * @property {boolean} isTimestampRoundedToSeconds When false, renders the timestamp
 *   including milliseconds. When true, rounds the timestamp to seconds and hides
 *   milliseconds during rendering.
 */

export default Component.extend(I18n, {
  layout,
  classNames: ['log-entry-details'],

  i18n: service(),
  globalClipboard: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.auditLogBrowser.logEntryDetails',

  /**
   * Log entry to show details. This component is visible only if `logEntry` is
   * not empty.
   * @virtual
   * @type {AuditLogEntry|undefined}
   */
  logEntry: undefined,

  /**
   * Extra data provided to configure default log-entry-details view.
   * @virtual
   * @type {DefaultLogEntryDetailsConfiguration}
   */
  logEntryDetailsConfiguration: undefined,

  /**
   * When false, renders the timestamp including milliseconds. When true,
   * rounds the timestamp to seconds and hides milliseconds during rendering.
   * @type {ComputedProperty<boolean>}
   */
  isTimestampRoundedToSeconds: or(
    'logEntryDetailsConfiguration.isTimestampRoundedToSeconds',
    raw(false),
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  stringifiedLogEntry: computed('logEntry', function stringifiedLogEntry() {
    const logEntry = this.logEntry;
    return JSON.stringify(logEntry, function replacer(key, value) {
      // Remove "id" property, because it is added by the infinite scroll mechanism
      if (this === logEntry && key === 'id') {
        return undefined;
      }
      return value;
    }, 2);
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
