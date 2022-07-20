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
import { translateEntrySeverity } from 'onedata-gui-common/utils/audit-log';
import layout from '../../templates/components/audit-log-browser/severity-cell';

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
});
