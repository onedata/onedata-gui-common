/**
 * Render list of items with checkboxes. Each change of selection is notified
 * using `onChange()` callback. This component does not change selection by itself
 * - needs a new injected selectedItems array instance on each change.
 * 
 * Yields for each item just after its' checkbox. Yielded properties:
 *  * model - a single item from items array
 *  * checkboxId - id of current item checkbox. Can be used for dedicated <label>
 *    elements.
 *
 * @module components/checkbox-list
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/checkbox-list';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { observer, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import $ from 'jquery';

export default Component.extend({
  layout,
  classNames: ['checkbox-list'],

  /**
   * @virtual
   * @type {string}
   */
  headerText: undefined,

  /**
   * @virtual
   * @type {Array<any>}
   */
  items: undefined,

  /**
   * @virtual
   * @type {Array<any>}
   */
  selectedItems: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {Array<any>} nextSelectedItems
   * @returns {any}
   */
  onChange: notImplementedIgnore,

  /**
   * @type {boolean}
   */
  isExpanded: true,

  /**
   * @type {Ember.ComputedProperty<true|false|2>}
   */
  summaryCheckboxValue: computed(
    'items.[]',
    'selectedItems.[]',
    function summaryCheckboxValue() {
      const itemsCount = (this.get('items') || []).length;
      const selectedItemsCount = (this.get('selectedItems') || []).length;

      if (itemsCount <= selectedItemsCount) {
        return true;
      } else if (selectedItemsCount > 0) {
        return 2;
      } else {
        return false;
      }
    }
  ),

  itemsObserver: observer('items', function itemsObserver() {
    let selectedItems = this.get('selectedItems') || [];
    const items = this.get('items') || [];

    const nextSelectedItems = selectedItems.filter(item => items.includes(item));
    if (nextSelectedItems.length !== selectedItems.length) {
      scheduleOnce('afterRender', this, 'notifyChange', nextSelectedItems);
    }
  }),

  notifyChange(newSelectedItems) {
    this.get('onChange')(newSelectedItems);
  },

  actions: {
    toggleExpand(event) {
      if (!$(event.target).is('.one-checkbox')) {
        this.toggleProperty('isExpanded');
      }
    },
    change(item) {
      let selectedItems = this.get('selectedItems') || [];

      if (selectedItems.includes(item)) {
        this.notifyChange(selectedItems.without(item));
      } else {
        this.notifyChange(selectedItems.concat([item]));
      }
    },
    changeViaHeader(value) {
      const newSelectedItems =
        this.set('selectedItems', value ? this.get('items') : []);
      this.notifyChange(newSelectedItems);
    },
  },
});
