/**
 * Invokes a function associated with keyboard key in the event. Key-function
 * association is provided by a map key->function as a first argument of the
 * helper.
 *
 * Example:
 * ```
 * <input
 *   onkeydown={{invoke-on-key (hash
 *     Enter=(action "action1")
 *     Escape=(action "action2")
 *   )}}
 * />
 * ```
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

/**
 * @param {[{ [key: string]: () => void }]} params
 * @returns {void}
 */
export function invokeOnKey(params) {
  const keyToCallbackMap = params[0];
  return (event) => {
    const key = event?.key;
    const keyCallback = keyToCallbackMap?.[key];

    if (typeof keyCallback === 'function') {
      event?.stopPropagation();
      keyCallback();
    }
  };
}

export default helper(invokeOnKey);
