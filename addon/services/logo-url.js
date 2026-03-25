/**
 * Fetch logo URL from server config.
 *
 * @author Agnieszka Raczek
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { computed } from '@ember/object';
import globals from 'onedata-gui-common/utils/globals';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

export default Service.extend({
  logoLinkProxy: computed(function logoLinkProxy() {
    const promise = (async () => {
      let response;
      try {
        response = await globals.fetch('/ozw/onezone/custom/frontpage/config.json');
        if (response.ok) {
          const config = await response.json();
          return config.logoUrl || '';
        }
        return '';
      } catch {
        return '';
      }
    })();
    return promiseObject(promise);
  }),
});
