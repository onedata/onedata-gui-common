/**
 * Renders a cell with a formatted audit log entry timestamp.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/audit-log-browser/timestamp-cell';

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
});
