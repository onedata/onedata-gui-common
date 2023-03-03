/**
 * A function that should be used for callbacks to inject that are
 * critical for code to work (even in tests).
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function notImplementedThrow() {
  throw new Error('not implemented');
}
