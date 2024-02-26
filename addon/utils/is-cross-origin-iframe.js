/**
 * Returns true if this Web application is embedded in an iframe that is hosted on the
 * other origin than this app.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

export default function isCrossOriginIframe() {
  try {
    return globals.window.location.origin !== globals.window.parent.location.origin;
  } catch {
    // getting parent origin means that it is blocked for security reasons
    return true;
  }
}
