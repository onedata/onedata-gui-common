/**
 * Check if user event like click or enter push is requesting opening new tab in browser.
 * Eg. ctrl + click.
 *
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @param {Event} event
 */

export default function isNewTabRequestEvent(event) {
  if (!event) {
    return false;
  }
  if (event.type === 'click') {
    if (event.button === 1 || event.which === 2) {
      return true;
    } else if (isWitchCtrlOpt(event)) {
      return true;
    } else {
      return false;
    }
  } else if (event.type === 'keydown') {
    return event.key === 'Enter' && isWitchCtrlOpt(event);
  }

  // if none of the above
  return false;
}

function isWitchCtrlOpt(event) {
  return event.getModifierState &&
    (event.getModifierState('Control') || event.getModifierState('Meta'));
}
