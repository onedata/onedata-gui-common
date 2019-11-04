/**
 * A first-level item in structurized one-list
 *
 * Currently used in ``two-level-sidebar``
 *
 * @module components/one-list-primary-item
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-list-primary-item';

export default Component.extend({
  layout,
  tagName: 'li',
  classNames: ['one-list-item', 'clickable'],
  classNameBindings: ['isActive:active'],

  isActive: false,

  /**
   * @type {function}
   * @param {string} itemId
   * @returns {undefined}
   */
  changePrimaryItem: () => {},
});
