/**
 * Returns true if this Web application is embedded in an iframe that is, or has ancestor
 * frame hosted on the other origin than this app.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

export default function isCrossOriginIframe() {
  const thisFrame = globals.window;
  try {
    let currentFrame = thisFrame;
    let parentFrame = thisFrame.parent;
    while (currentFrame !== parentFrame) {
      if (currentFrame.origin !== parentFrame.origin) {
        return true;
      }
      currentFrame = parentFrame;
      parentFrame = parentFrame.parent;
    }
    return false;
  } catch {
    // getting parent origin means that it is blocked for security reasons
    return true;
  }
}
