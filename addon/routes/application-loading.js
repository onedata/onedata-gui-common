/**
 * Remove static loader and do some procedures before application route handler
 * 
 * @module routes/application-loading
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
export default Route.extend({
  activate() {
    this._super(...arguments);
    const preAppLoadingElement = document.getElementById('index-pre-app-loading');
    if (preAppLoadingElement) {
      preAppLoadingElement.remove();
    }
  },
});
