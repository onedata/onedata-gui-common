/**
 * Base service for generating API URLs for various operations in Onedata.
 *
 * @author Jakub Liput, Agnieszka Warchoł
 * @copyright (C) 2021-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import pupa from 'pupa';
import { shellEscape, ShellSafeString } from 'onedata-gui-common/utils/shell-escape';

export default Service.extend({
  /**
   * @param {String|Array<String>} apiTemplate
   * @param {Object} templateParams
   * @returns {String}
   */
  fillTemplate(apiTemplate, templateParams = {}) {
    if (typeof apiTemplate === 'string') {
      return pupa(apiTemplate, templateParams);
    } else if (Array.isArray(apiTemplate)) {
      return shellEscape(apiTemplate.map(str => {
        if (str instanceof ShellSafeString) {
          return new ShellSafeString(pupa(str.string, templateParams));
        } else {
          return pupa(str, templateParams);
        }
      }));
    } else {
      return '';
    }
  },
});
