/**
 * Prevents from page unload by showing alert message before page change.
 * Usage instructions:
 *  - value returned by this function should be also returned in the unload
 *    event handler,
 *  - `confirmationMessage` is a mandatory argument, but it is not guaranteed
 *    that it will be shown to the user. Some browsers ignore it and show
 *    some generic question.
 *
 * Code is based on https://stackoverflow.com/a/19538231
 *
 * @module utils/prevent-page-unload
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function preventPageUnload(unloadEvent, confirmationMessage) {
  if (unloadEvent) {
    unloadEvent.preventDefault();
  }
  (unloadEvent || window.unloadEvent).returnValue = confirmationMessage;
  return confirmationMessage;
}
