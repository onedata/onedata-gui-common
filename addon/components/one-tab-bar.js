/**
 * Create scrollable and searchable tab bar using items array with tabs
 * specification.
 * 
 * @module components/one-tab-bar
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-tab-bar';
import { sort } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  classNames: ['one-tab-bar'],
  classNameBindings: ['tabsOverflow:tabs-overflowing'],

  media: service(),

  /**
   * Array of items representing each tab. Properties of each:
   * - id - will be used to create classes and indentify tabs
   * - name - displayed text in the tab
   * - icon - name of one-icon used in item (optional)
   * - class - CSS classes added to tab-bar-li component (optional)
   * @type {Array}
   */
  items: undefined,

  /**
   * Set item that will be active. Look at `selectDefaultOnInit` to see how
   * first item can be set automatically.
   * @type {any}
   */
  selectedItem: undefined,

  tabsOverflow: undefined,

  /**
   * If set to true, sets first tab as active if `selectedItem` is undefined
   * on component init. If you want to use this flag and set no item at all,
   * set `selectedItem` to `null`.
   * @type {boolean}
   */
  selectDefaultOnInit: true,

  itemsSorting: Object.freeze(['name']),

  sortedItems: sort('items', 'itemsSorting'),

  init() {
    this._super(...arguments);
    if (this.get('selectDefaultOnInit') && this.get('selectedItem') === undefined) {
      this.set('selectedItem', this.get('sortedItems')[0]);
    }
  },

  didInsertElement() {
    this._super(...arguments);
    this.jumpToItem(this.get('selectedItem.id'));
  },

  /**
   * Default implementation of method invoked when the item is selected from
   * tab bar. In most cases, it should be imlpemented in parent component
   * to set new item, and pass the new item down.
   * If the item wasn't changed (eg. parent component blocked the change)
   * it should return false to stop tab bar change behaviour.
   * @param {object|EmberObject} item
   */
  selectedItemChanged: computed(function selectedItemChanged() {
    return (item) => {
      this.set('selectedItem', item);
    };
  }),

  jumpToItem(itemId) {
    const $item = this.$(`.item-${itemId}`);
    if ($item.length) {
      const $content = this.$('.container-inner-scroll-content');
      $content.animate({ scrollLeft: $item[0].offsetLeft }, 200);
    }
  },

  actions: {
    // TODO: handle change of element when injected property changes (use internal prop.)
    /**
     * @param {string} selectType one of: tabClick, selector, init
     * @param {object} item on of `items`
     */
    selectItem(selectType, item) {
      const changed = this.get('selectedItemChanged')(item);
      if (changed !== false) {
        if (selectType === 'selector') {
          this.jumpToItem(get(item, 'id'));
        }
      }
    },
  },
});
