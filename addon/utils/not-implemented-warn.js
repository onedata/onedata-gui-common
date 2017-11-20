/**
 * A function that should be used for callbacks to inject that are
 * recommended but not critical for code to work (eg. for tests).
 *
 * @module utils/not-implemented-warn
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function notImplementedWarn() {
  console.warn('not implemented');
}
