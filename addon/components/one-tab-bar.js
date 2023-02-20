/**
 * Create scrollable and searchable tab bar using items array with tabs
 * specification.
 *
 * @module components/one-tab-bar
 * @author Jakub Liput
 * @copyright (C) 2019-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-tab-bar';
import { sort } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import { or, raw, conditional, and, eq, not } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

/**
 * @typedef {'always'|'overflowOrMobile'|'onlyMobile'|'onlyOverflow'|'never'} OneTabBarDropdownRenderMode
 */

/**
 * @typedef {'always'|'nonMobile'} OneTabBarTabsRenderMode
 */

export default Component.extend({
  layout,
  classNames: ['one-tab-bar'],
  classNameBindings: [
    'tabsOverflow:tabs-overflowing',
    'isDropdownRendered:with-dropdown',
  ],

  media: service(),

  /**
   * Array of items representing each tab. Properties of each:
   * - id - will be used to create classes and identify tabs
   * - name - displayed text in the tab
   * - icon - name of one-icon used in item (optional)
   * - class - CSS classes added to tab-bar-li component (optional)
   * @virtual
   * @type {Array}
   */
  items: undefined,

  /**
   * @virtual
   * @type {string}
   */
  tabBarLiComponentName: undefined,

  /**
   * @virtual optional
   * @type {OneTabBarDropdownRenderMode}
   */
  dropdownRenderMode: 'overflowOrMobile',

  /**
   * @virtual optional
   * @type {OneTabBarTabsRenderMode}
   */
  tabsRenderMode: 'nonMobile',

  /**
   * Set item that will be active. Look at `selectDefaultOnInit` to see how
   * first item can be set automatically.
   * @virtual optional
   * @type {any}
   */
  selectedItem: undefined,

  /**
   * If true, tabs overflow container, so additional navigation should be rendered.
   * @type {boolean}
   */
  tabsOverflow: undefined,

  /**
   * If set to true, sets first tab as active if `selectedItem` is undefined
   * on component init. If you want to use this flag and set no item at all,
   * set `selectedItem` to `null`.
   * @type {boolean}
   */
  selectDefaultOnInit: true,

  itemsSorting: Object.freeze(['name']),

  /**
   * @type {boolean}
   */
  isSorted: true,

  /**
   * @type {ComputedProperty<string>}
   */
  effTabBarLiComponentName: or(
    'tabBarLiComponentName',
    raw('one-tab-bar/tab-bar-li')
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isDropdownRendered: or(
    eq('dropdownRenderMode', raw('always')),
    and(
      eq('dropdownRenderMode', raw('overflowOrMobile')),
      or('tabsOverflow', 'media.isMobile'),
    ),
    and(
      eq('dropdownRenderMode', raw('onlyOverflow')),
      'tabsOverflow',
    ),
    and(
      eq('dropdownRenderMode', raw('onlyMobile')),
      'media.isMobile',
    ),
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isTabBarRendered: or(
    eq('tabsRenderMode', raw('always')),
    and(
      eq('tabsRenderMode', raw('nonMobile')),
      not('media.isMobile'),
    ),
  ),

  sortedItems: conditional(
    'isSorted',
    sort('items', 'itemsSorting'),
    'items'
  ),

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
    const item = this.element.querySelector(`.item-${itemId}`);
    if (!item) {
      return;
    }
    /**
     * @type {HTMLElement}
     */
    const content = this.element.querySelector('.container-inner-scroll-content');
    // scrollTo on very old browsers (pre-2017) is not supported and ignored
    content?.scrollTo?.({ left: item.offsetLeft, behavior: 'smooth' });
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
