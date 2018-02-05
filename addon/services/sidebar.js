/**
 * Provides global state of one-sidebar
 *
 * @module services/sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

import { A } from '@ember/array';
import { computed } from '@ember/object';

/**
 * Global control over sidebar
 */
export default Service.extend({
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
