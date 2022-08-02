/**
 * Renders a cell with a formatted audit log entry severity.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { getBy } from 'ember-awesome-macros';
import {
  EntrySeverity,
  translateEntrySeverity,
} from 'onedata-gui-common/utils/audit-log';
import layout from 'onedata-gui-common/templates/components/audit-log-browser/severity-cell';

const defaultSeverityIcons = Object.freeze({
  [EntrySeverity.Debug]: 'browser-info',
  [EntrySeverity.Info]: 'browser-info',
  [EntrySeverity.Notice]: 'browser-info',
  [EntrySeverity.Warning]: 'checkbox-filled-warning',
  [EntrySeverity.Alert]: 'checkbox-filled-warning',
  [EntrySeverity.Error]: 'checkbox-filled-x',
  [EntrySeverity.Critical]: 'checkbox-filled-x',
  [EntrySeverity.Emergency]: 'checkbox-filled-x',
});

export default Component.extend({
  layout,
  tagName: 'td',
  classNames: ['severity-cell'],

  i18n: service(),

  /**
   * @virtual
   * @type {AuditLogEntry}
   */
  logEntry: undefined,

  /**
   * @virtual optional
   * @type {Object<AuditLogEntrySeverity, string>}
   */
  severityIcons: defaultSeverityIcons,

  /**
   * @type {ComputedProperty<SafeString>}
   */
  severityTranslation: computed(
    'logEntry.severity',
    function severityTranslation() {
      return translateEntrySeverity(
        this.get('i18n'),
        this.get('logEntry.severity')
      );
    }
  ),

  /**
   * @type {ComputedProperty<String|undefined>}
   */
  severityIcon: getBy('severityIcons', 'logEntry.severity'),
});
