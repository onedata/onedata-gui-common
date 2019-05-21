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
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

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
    const collectionProxy = this.getCollectionFor(resourceType);
    return collectionProxy
      .then(collection => {
        if (isRecord(collection)) {
          return collection;
        } else if (get(collection, 'list')) {
          return Promise.all(get(collection, 'list')).then(() =>
            collection
          );
        } else {
          return Promise.all(collection).then(() =>
            EmberObject.create({ list: collectionProxy })
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
