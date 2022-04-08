/**
 * Base service for generating API URLs for various operations in Onedata.
 *
 * @module services/api-string-generator
 * @author Jakub Liput, Agnieszka Warchoł
 * @copyright (C) 2021-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import pupa from 'npm:pupa';
import shellEscape from 'npm:shell-escape';

export default Service.extend({
  fillTemplate(apiTemplate, templateParams) {
    if (typeof apiTemplate === 'string') {
      return pupa(apiTemplate, templateParams);
    } else if (Array.isArray(apiTemplate)) {
      return shellEscape(apiTemplate.map(arg => pupa(arg, templateParams)));
    } else {
      return '';
    }
  },
});
