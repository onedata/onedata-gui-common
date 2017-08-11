/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @module services/content-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  RSVP: {
    Promise
  },
  inject: {
    service
  },
} = Ember;

export default Ember.Service.extend({
  clusterManager: service(),
  userManager: service(),

  /**
   * @param {string} type
   * @returns {Promise}
   */
  getModelFor(type, id) {
    switch (type) {
      case 'clusters':
        return this.get('clusterManager').getDefaultRecord(id).get('promise');
      case 'users':
        return this.get('userManager').getUserDetails(id).get('promise');

      default:
        return new Promise((resolve, reject) => reject('No such model type: ' + type));
    }
  },
});
