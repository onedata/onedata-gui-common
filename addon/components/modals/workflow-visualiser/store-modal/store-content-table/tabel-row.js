/**
 * Single store table content row
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table/table-header
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/tabel-row';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-row'],
  attributeBindings: ['entry.index:data-row-id'],

  /**
   * @virtual
   * @type {String}
   */
  storeType: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  dataSpec: undefined,

  /**
   * Must have two fields: index (string) and value (of any type)
   * @virtual
   * @type {Object}
   */
  entry: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  valueAsJson: computed('entry.value', function valueAsJson() {
    return JSON.stringify(this.get('entry.value'), null, 2);
  }),
});
