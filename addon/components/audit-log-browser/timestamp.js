/**
 * Renders a string with a formatted audit log entry timestamp. The timestamp
 * can be converted to a string in two ways - with or without milliseconds -
 * see `isTimestampRoundedToSeconds` property.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/audit-log-browser/timestamp';

export default Component.extend({
  layout,
  tagName: '',

  /**
   * Audit log entry timestamp to render. It's in milliseconds.
   * @virtual
   * @type {number}
   */
  timestamp: undefined,

  /**
   * When false, renders the timestamp including milliseconds. When true,
   * rounds the timestamp to seconds and hides milliseconds during rendering.
   * @virtual optional
   * @type {boolean}
   */
  isTimestampRoundedToSeconds: false,

  /**
   * Timestamp in a log entry is in milliseconds. We need to convert it to
   * seconds, because that is how `date-format` helper interprets passed timestamp.
   * @type {ComputedProperty<number>}
   */
  timestampInSeconds: computed('timestamp', function timestampInSeconds() {
    return this.get('timestamp') / 1000;
  }),
});
