/**
 * Fixes JS evaluation in Firefox and Safari after back button press.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import $ from 'jquery';
import { next } from '@ember/runloop';
import globals from 'onedata-gui-common/utils/globals';

export function initialize(applicationInstance) {
  // Fix for Firefox
  globals.window.addEventListener('unload', function () {});

  // Hack to not use Safari cache
  const browser = applicationInstance.lookup('service:browser');
  const isSafari = browser.get('browserName') === 'safari';
  if (isSafari) {
    $(globals.window).bind('pagehide', function () {
      globals.window.onedataIsReloadingApp = 1;
      next(() => globals.location.reload());
    });
  }
}

export default {
  initialize: initialize,
};
