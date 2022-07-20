/**
 * Renders a cell with a formatted audit log entry timestamp. The timestamp
 * can be converted to a string in two ways - with or without milliseconds -
 * see `isTimestampRoundedToSeconds` property.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../templates/components/audit-log-browser/timestamp-cell';

export default Component.extend({
  layout,
  tagName: 'td',
  classNames: ['timestamp-cell'],

  /**
   * @virtual
   * @type {AuditLogEntry}
   */
  logEntry: undefined,

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
    'logEntry.timestamp',
    function timestampInSeconds() {
      return this.get('logEntry.timestamp') / 1000;
    }
  ),
});
