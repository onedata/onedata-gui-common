/**
 * Resolves after timeout
 * 
 * @module utils/sleep
 * @author Jakub Liput
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';
import { Promise } from 'rsvp';
import { later } from '@ember/runloop';

export default async function sleep(timeout) {
  const scheduleFun = (config.environment === 'test') ? setTimeout : later;
  await new Promise(resolve => scheduleFun(resolve, timeout));
}
