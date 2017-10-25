/**
 * An util function, that checks if given object may be an Ember Data record.
 *
 * @module utils/is-record
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

export default function isRecord(testObject) {
  return testObject && !!get(testObject, 'store');
}
