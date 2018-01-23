/**
 * @abstract To implement in specific projects
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  /**
   * @abstract
   * @param {string} type
   * @returns {Promise.Array.Record|PromiseArray.Record|PromiseObject.Array.Record}
   */
  getCollectionFor( /* type */ ) {
    throw new Error('service:sidebar-resources: not implemented')
  },
});
