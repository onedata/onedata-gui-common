/**
 * A service that provides information about the user browser.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { computed } from '@ember/object';

/**
 * @typedef {'opera'|'ie'|'chrome'|'safari'|'firefox'|'other'} BrowserName
 */

const userAgentBrowserNameMatchers = [{
  matcher: 'opera',
  browserName: 'opera',
}, {
  matcher: 'msie',
  browserName: 'ie',
}, {
  matcher: 'chrome',
  browserName: 'chrome',
}, {
  matcher: 'safari',
  browserName: 'safari',
}, {
  matcher: 'firefox',
  browserName: 'firefox',
}];

export default Service.extend({
  /**
   * @type {Window}
   */
  window,

  /**
   * @type {ComputedProperty<BrowserName>}
   */
  browserName: computed('window', function browserName() {
    const userAgentLowerCase =
      (this.get('window.navigator.userAgent') || '').toLowerCase();

    for (const { matcher, browserName: name } of userAgentBrowserNameMatchers) {
      if (userAgentLowerCase.includes(matcher)) {
        return name;
      }
    }

    return 'other';
  }),
});