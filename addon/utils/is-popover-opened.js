/**
 * Returns true if some webui popover is opened somewhere on the page.
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

export default function isPopoverOpened() {
  return Boolean(globals.document.querySelector(
    '.webui-popover.in'
  ));
}
