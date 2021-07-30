/**
 * Shows formatted timestamp.
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table/cell-timestamp-ms
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/cell-timestamp-ms';

export default Component.extend({
  layout,
  classNames: ['custom-cell-timestamp-ms', 'nowrap'],

  /**
   * @virtual
   * @type {String}
   */
  value: undefined,

  /**
   * @type {ComputedProperty<Number|null>}
   */
  timestamp: computed('value', function timestamp() {
    const value = this.get('value');
    return Number.isInteger(value) ? value / 1000 : null;
  }),
});
