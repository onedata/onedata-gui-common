/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  /**
   * @param {string} type
   * @returns {Promise}
   */
  getModelFor( /* type, id */ ) {
    throw new Error('service:content-resources: not implemented');
  },
});
