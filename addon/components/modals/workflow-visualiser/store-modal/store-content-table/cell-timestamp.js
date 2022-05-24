/**
 * Shows formatted timestamp.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/cell-timestamp';

/**
 * @typedef {Object} StoreContentTableCellTimestampSettings
 * @property {'second'|'millisecond'} timestampUnit
 * @property {boolean} areMillisecondsVisible
 */

export default Component.extend({
  layout,
  classNames: ['custom-cell-timestamp', 'nowrap'],

  /**
   * @virtual
   * @type {String}
   */
  value: undefined,

  /**
   * @virtual
   * @type {StoreContentTableCellTimestampSettings}
   */
  settings: undefined,

  /**
   * @type {ComputedProperty<Number|null>}
   */
  timestamp: computed('value', 'settings.timestampUnit', function timestamp() {
    const value = this.get('value');
    const timestampUnit = this.get('settings.timestampUnit');
    const timestampDivisor = timestampUnit === 'millisecond' ? 1000 : 1;
    return Number.isInteger(value) ? value / timestampDivisor : null;
  }),

  /**
   * @type {ComputedProperty<'report'|'detailedReport'>}
   */
  timestampFormatter: computed(
    'settings.areMillisecondsVisible',
    function timestampFormatter() {
      return this.get('settings.areMillisecondsVisible') ?
        'detailedReport' : 'report';
    }
  ),
});
