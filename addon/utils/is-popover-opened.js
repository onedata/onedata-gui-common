/**
 * Returns true if some webui popover is opened somewhere on the page.
 * 
 * @module 
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function isPopoverOpened() {
  return Boolean(document.querySelector(
    '.webui-popover.in'
  ));
}
