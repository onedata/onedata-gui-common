/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @module services/content-resources
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import modelRoutableId from 'onedata-gui-common/utils/model-routable-id';

export default Service.extend({
  /**
   * @param {string} type
   * @returns {Promise}
   */
  getModelFor( /* type, id */ ) {
    throw new Error('service:content-resources: not implemented')
  },

  /**
   * @param {object|string} model
   * @returns {string}
   */
  getRoutableIdFor(model) {
    return modelRoutableId(model);
  }
});
