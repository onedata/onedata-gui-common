/**
 * Allows to access properties of a browser on which this code is running.
 *
 * `Browser` is intended to be a singleton. You should use the already created
 * instance exported from this module.
 *
 * Example - checking which browser we are using:
 * ```
 * import browser, { BrowserName } from 'onedata-gui-common/utils/browser';
 *
 * if (browser.name === BrowserName.Safari) {
 *  // do sth specific for Safari
 * }
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

/**
 * @typedef {'chrome'|'firefox'|'ie'|'opera'|'safari'|'other'} BrowserName
 */

/**
 * @type {Object<string, BrowserName>}
 */
export const BrowserName = Object.freeze({
  Chrome: 'chrome',
  Firefox: 'firefox',
  IE: 'ie',
  Opera: 'opera',
  Safari: 'safari',
  Other: 'other',
});

/**
 * @type {Array<{ matcher: string, browserName: BrowserName }>}
 */
const userAgentBrowserNameMatchers = Object.freeze([{
  matchers: ['opera'],
  browserName: BrowserName.Opera,
}, {
  matchers: ['msie', 'trident'],
  browserName: BrowserName.IE,
}, {
  matchers: ['chrome'],
  browserName: BrowserName.Chrome,
}, {
  matchers: ['safari'],
  browserName: BrowserName.Safari,
}, {
  matchers: ['firefox'],
  browserName: BrowserName.Firefox,
}]);

class Browser {
  /**
   * @public
   * @returns {string}
   */
  get userAgent() {
    return globals.navigator.userAgent ?? '';
  }

  /**
   * @public
   * @returns {BrowserName}
   */
  get name() {
    const userAgentLowerCase = this.userAgent.toLowerCase();

    for (const { matchers, browserName } of userAgentBrowserNameMatchers) {
      if (matchers.some((matcher) => userAgentLowerCase.includes(matcher))) {
        return browserName;
      }
    }

    return BrowserName.Other;
  }
}

/**
 * @type {Browser}
 */
const browserInstance = new Browser();

export default browserInstance;
