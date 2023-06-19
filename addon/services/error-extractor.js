/**
 * A service that provides method to extract error messages from passed backend
 * errors.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import getErrorDescription from 'onedata-gui-common/utils/get-error-description';

export default Service.extend({
  i18n: service(),

  /**
   * Function that extracts error message from error response object
   * @type {function}
   * @returns {string}
   */
  extractorFunction: getErrorDescription,

  /**
   * @returns {object} `{ message: SafeString,  errorJsonString: SafeString }`
   */
  getMessage(error) {
    const {
      i18n,
      extractorFunction,
    } = this.getProperties('i18n', 'extractorFunction');
    return extractorFunction(error, i18n);
  },

  /**
   * @param {*} error
   * @returns {string}
   */
  getType(error) {
    const errorId = (error || {}).id;
    switch (errorId) {
      case 'forbidden':
        return 'forbidden';
      default:
        return 'error';
    }
  },
});
