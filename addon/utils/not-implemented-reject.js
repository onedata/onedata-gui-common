/**
 * A function that should be used for callbacks to inject that
 * return promises and are critical for code to work.
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

export default function rejectNotImplemented() {
  return Promise.reject({
    message: 'not implemented',
  });
}
