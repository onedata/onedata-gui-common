/**
 * Single main menu item
 * 
 * @module components/main-menu-item
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/main-menu-item';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  tagName: 'li',
  classNames: ['main-menu-item', 'one-list-item'],
  classNameBindings: [
    'isActive:active',
    'isSelected:selected',
    'isDisabled:disabled:enabled',
    'isDisabled::clickable',
    'isLoading:loading',
    'isFailed:failed',
  ],

  i18n: service(),
  router: service(),

  item: null,
  isActive: false,
  isSelected: false,
  isLoading: false,
  isFailed: false,

  /**
   * @type {function}
   * @param {string} item
   * @returns {undefined}
   */
  itemClicked: () => {},

  /**
   * @type {Ember.ComputerProperty<string>}
   */
  name: computed('item.id', function name() {
    const {
      item,
      i18n,
    } = this.getProperties('item', 'i18n');
    return i18n.t(`tabs.${item.id}.menuItem`);
  }),

  /**
   * @override
   * @param {MouseEvent} clickEvent 
   * @returns {boolean|undefined}
   */
  click(clickEvent) {
    if (!this.get('isDisabled')) {
      const item = this.get('item');
      if (clickEvent.ctrlKey || clickEvent.metaKey || clickEvent.shiftKey) {
        this.openInNewTab(item);
      } else {
        this.get('itemClicked')(item);
      }
      return false;
    }
  },

  /**
   * @override
   * @param {MouseEvent} mouseEvent
   */
  mouseDown(mouseEvent) {
    if (mouseEvent.button === 1) {
      this.openInNewTab();
    }
  },

  openInNewTab() {
    window.open(
      this.get('router').urlFor('onedata.sidebar', this.get('item.id')),
      '_blank'
    );
  },
});
