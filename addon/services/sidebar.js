/**
 * Provides global state of one-sidebar
 *
 * @module services/sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  A,
  computed
} = Ember;

/**
 * Global control over sidebar
 */
export default Ember.Service.extend({
  /**
   * Set to true if level-0 item is loading it's view
   * @type {boolean}
   */
  isLoadingItem: false,

  itemPath: computed(function () {
    return A();
  }).readOnly(),

  changeItems(level, ...items) {
    let itemPath = this.get('itemPath');
    itemPath.replace(level, itemPath.length - level, items);
  }
});
