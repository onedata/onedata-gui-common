/**
 * Resolves after timeout
 * 
 * @module utils/sleep
 * @author Jakub Liput
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';
import { later } from '@ember/runloop';

export default async function sleep(timeout) {
  await new Promise(resolve => later(resolve, timeout));
}
