const nonIframeRedirectFlag = 'oneprovider-non-iframe-redirect';

export default Object.freeze({
  shouldRedirectToOnezone() {
    return !this.getNonIframeRedirectFlag() && !this.isInIframe();
  },

  /**
   * If application that should be opened in unifed GUI's iframe is attempted to be opened
   * directly in window, redirect to its dedicated view in unified GUI (Onezone).
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
   * @return {void}
   */
  setAsOpened() {
    this.setNonIframeRedirectFlag(false);
  },

  isInIframe() {
    return window.parent !== window;
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
