/**
 * Single store table content row
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table/table-row
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table/table-row';
import { computed, getProperties } from '@ember/object';

export default Component.extend({
  layout,
  tagName: 'tr',
  classNames: ['table-row', 'data-row'],
  classNameBindings: ['entry.success::error-row'],
  attributeBindings: ['entry.id:data-row-id'],

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
   * Must have three fields: id (string), index (string) and value (of any type)
   * @virtual
   * @type {StoreContentTableEntry}
   */
  entry: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  valueAsJson: computed('entry.{success,value,error}', function valueAsJson() {
    const {
      success,
      value,
      error,
    } = getProperties(this.get('entry') || {}, 'success', 'value', 'error');
    const valueToStringify = success !== false ? value : error;
    return JSON.stringify(valueToStringify, null, 2);
  }),
});
