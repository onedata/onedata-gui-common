/**
 * Bug fixes for perfect scrollbar. See comments in code for fixes description.
 * You should use this exported class to construct PerfectScrollbar instead of original
 * Node package!
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as OriginalPerfectScrollbar } from 'perfect-scrollbar';
import browser, { BrowserName } from 'onedata-gui-common/utils/browser';

export default class PerfectScrollbar extends OriginalPerfectScrollbar {
  constructor(element, userSettings = {}) {
    const effUserSettings = { ...userSettings };
    // There is a bug (or conscious implementation) on Safari (v16) that causes
    // scrollWidth or scrollHeight to be rounded in an unexpected way for original
    // perfect-scrollbar implementation when the browser window has zoom greater
    // than 100%. Invalid size rounding causes scrollbar to appear (container is
    // considered as 1px smaller than content). Adding 1px to tolerate difference between
    // container and content solves the issue.
    // Note, that due to this fix, you could have 1px trimmed content on Safari, but
    // for various reasons, this is the best solution for this problem. Other solution
    // could be modifying internal implementation of library, but we don't want it.
    if (browser.name === BrowserName.Safari) {
      setDefaultSafariMarginOffset(effUserSettings, 'X');
      setDefaultSafariMarginOffset(effUserSettings, 'Y');
    }
    super(element, effUserSettings);
  }
}

/**
 * @param {Object} settings
 * @param {'X'|'Y'} axis
 */
function setDefaultSafariMarginOffset(settings, axis) {
  const axisProperty = `scroll${axis}MarginOffset`;
  if (typeof settings[axisProperty] === 'number') {
    settings[axisProperty] += 1;
  } else {
    settings[axisProperty] = 1;
  }
}
