/**
 * A service that provides information about the user browser.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { computed } from '@ember/object';
import globals from 'onedata-gui-common/utils/globals';

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
   * @type {ComputedProperty<BrowserName>}
   */
  browserName: computed(function browserName() {
    return getBrowserName();
  }),
});

export function getBrowserName() {
  const userAgentLowerCase = (globals.navigator.userAgent || '').toLowerCase();

  for (const { matcher, browserName: name } of userAgentBrowserNameMatchers) {
    if (userAgentLowerCase.includes(matcher)) {
      return name;
    }
  }

  return 'other';
}
