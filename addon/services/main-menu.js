/**
 * A global state of main menu
 *
 * @module services/main-menu
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Service.extend({
  currentItemId: null,

  /**
   * Set to true, if the currentItem is in loading state (the corresponding page
   * is not loaded yet).
   * @type {boolean}
   */
  isLoadingItem: false,

  /**
   * Set to true, if the currentItem is in failed state (the corresponding page
   * failed to load eg. because of model rejection)
   * @type {boolean}
   */
  isFailedItem: false,

  currentItemIdChanged(id) {
    this.set('currentItemId', id);
  },
});
