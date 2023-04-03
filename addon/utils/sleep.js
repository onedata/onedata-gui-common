/**
 * Resolves after timeout
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

export default async function sleep(timeout) {
  await new Promise(resolve => setTimeout(resolve, timeout));
}
