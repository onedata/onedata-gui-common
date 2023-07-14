/**
 * Remove static loader and do some procedures before application route handler
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import globals from 'onedata-gui-common/utils/globals';

export default Route.extend({
  activate() {
    this._super(...arguments);
    const preAppLoadingElement = globals.document.getElementById('index-pre-app-loading');
    if (preAppLoadingElement) {
      preAppLoadingElement.remove();
    }
  },
});
