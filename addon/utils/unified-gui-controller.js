/**
 * Utils for opening embedded apps in unified Onezone GUI.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';

const nonIframeRedirectFlag = 'oneprovider-non-iframe-redirect';

export default Object.freeze({
  /**
   * Checks if current location should be changed to Onezone unified GUI.
   * This method should be invoked only in embedded service (eg. Oneprovider GUI),
   * because in unified Onezone GUI it makes no sense (we are already on unified GUI).
   * @public
   * @returns {boolean}
   */
  shouldRedirectToOnezone() {
    return this.isNonDummyEnvironment() &&
      !this.getNonIframeRedirectFlag() &&
      !this.isInIframe();
  },

  /**
   * If application that should be opened in unifed GUI's iframe is attempted to be opened
   * directly in window, redirect to its dedicated view in unified GUI (Onezone).
   * @public
   * @param {string} [path] Everthing after origin in Onezone URL: location's
   *   pathname + search + hash.
   * @return {void}
   */
  redirectToOnezone(path) {
    const url = window.origin + (path || '');
    this.setNonIframeRedirectFlag(true);
    window.location.replace(url);
  },

  /**
   * Invoke when unified GUI (Onezone GUI) has been opened.
   * It sets redirect flags to not lock redirection from Oneprovider GUI anymore.
   * @public
   * @return {void}
   */
  setAsOpened() {
    this.setNonIframeRedirectFlag(false);
  },

  isInIframe() {
    return window.parent !== window;
  },

  isNonDummyEnvironment() {
    return ['production', 'development-backend'].includes(config.environment);
  },

  /**
   * True if last load of the Oneprovider GUI in current browser tab caused redirect
   * to other location becuase it attempted to load not in an iframe.
   * @returns {boolean}
   */
  getNonIframeRedirectFlag() {
    return Boolean(window.sessionStorage.getItem(nonIframeRedirectFlag));
  },

  /**
   * @param {boolean} willRedirect Use true if you are going to redirect location to other
   *   URL. Use false to clear the flag.
   */
  setNonIframeRedirectFlag(willRedirect = true) {
    if (willRedirect) {
      window.sessionStorage.setItem(nonIframeRedirectFlag, 'true');
    } else {
      window.sessionStorage.removeItem(nonIframeRedirectFlag);
    }
  },
});
