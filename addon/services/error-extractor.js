/**
 * A service that provides method to extract error messages from passed backend
 * errors.
 * 
 * @module services/error-extractor
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import getErrorDetails from 'onedata-gui-common/utils/get-error-description';

export default Service.extend({
  i18n: service(),

  /**
   * Function that extracts error message from error response object
   * @type {function}
   * @returns {string}
   */
  extractorFunction: getErrorDetails,

  /** 
   * @returns {string}
   */
  getMessage(error) {
    const {
      i18n,
      extractorFunction,
    } = this.getProperties('i18n', 'extractorFunction');
    return extractorFunction(error, i18n);
  }
});
