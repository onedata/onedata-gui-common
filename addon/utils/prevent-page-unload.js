/**
 * Prevents from page unload by showing alert message before page change.
 * Usage instructions:
 *  - should be used inside `beforeunload` event listener,
 *  - value returned by this function should be also returned by the
 *    event listener,
 *  - `confirmationMessage` is a mandatory argument, but it is not guaranteed
 *    that it will be shown to the user. Some browsers ignore it and show
 *    some generic question.
 *
 * Code is based on https://stackoverflow.com/a/19538231
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {BeforeUnloadEvent} beforeUnloadEvent
 * @param {String} confirmationMessage
 * @returns {String}
 */
export default function preventPageUnload(
  beforeUnloadEvent,
  confirmationMessage
) {
  if (beforeUnloadEvent) {
    beforeUnloadEvent.preventDefault();
  }
  (beforeUnloadEvent || window.event).returnValue = confirmationMessage;
  return confirmationMessage;
}
