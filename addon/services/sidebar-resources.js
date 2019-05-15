/**
 * @abstract To implement in specific projects
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get } from '@ember/object';
import Service from '@ember/service';
import isRecord from 'onedata-gui-common/utils/is-record';

export default Service.extend({
  /**
   * @abstract
   * @param {string} type
   * @returns {Promise.Array.Record|PromiseArray.Record|PromiseObject.Array.Record}
   */
  getCollectionFor( /* type */ ) {
    throw new Error('service:sidebar-resources: not implemented')
  },

  /**
   * Returns Promise ready to be consumed by sidebar
   * @param {string} resourceType 
   */
  getSidebarModelFor(resourceType) {
    return this.getCollectionFor(resourceType)
      .then(proxyCollection => {
        if (isRecord(proxyCollection)) {
          return proxyCollection;
        } else if (get(proxyCollection, 'list')) {
          return Promise.all(get(proxyCollection, 'list')).then(() =>
            proxyCollection
          );
        } else {
          return Promise.all(proxyCollection).then(list =>
            EmberObject.create({ list })
          );
        }
      }).then(collection => {
        return {
          resourceType,
          collection,
        };
      });
  },

  /**
   * @param {string} resourceType 
   * @returns {Array<string>}
   */
  getItemsSortingFor(resourceType) {
    if (resourceType === 'clusters') {
      return ['type:desc', 'name'];
    } else {
      return ['name'];
    }
  },
});
