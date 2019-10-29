/**
 * Remove static loader and do some procedures before application route handler
 * 
 * @module routes/application-loading
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import $ from 'jquery';

// generated with https://realfavicongenerator.net
const faviconHtml =
  `
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="manifest" href="manifest.json">
<link rel="mask-icon" href="safari-pinned-tab.svg" color="#ee3f3f">
<meta name="theme-color" content="#363636">
  `;

export default Route.extend({
  activate() {
    this._super(...arguments);
    this.addFavicon();
    const preAppLoadingElement = document.getElementById('index-pre-app-loading');
    if (preAppLoadingElement) {
      preAppLoadingElement.remove();
    }
  },

  addFavicon() {
    $(document.head).append(faviconHtml);
  },
});
