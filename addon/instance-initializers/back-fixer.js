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
import browser, { BrowserName } from 'onedata-gui-common/utils/browser';

export function initialize() {
  // Fix for Firefox
  globals.window.addEventListener('unload', function () {});

  // Hack to not use Safari cache
  const isSafari = browser.name === BrowserName.Safari;
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
