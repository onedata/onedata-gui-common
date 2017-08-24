/**
 * @abstract To implement in specific projects
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Service.extend({
  /**
   * @param {string} type
   * @returns {Promise}
   */
  getCollectionFor( /* type */ ) {
    throw new Error('service:sidebar-resources: not implemented')
  },
});
