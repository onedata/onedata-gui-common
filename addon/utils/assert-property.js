/**
 * Helps detecting not injected properties into object
 * 
 * @module utils/assert-property
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { assert } from '@ember/debug';
import { get } from '@ember/object';

const defaultCondition = value => value != null;

export default function assertProperty(obj, propertyName, condition = defaultCondition) {
  const value = get(obj, propertyName);
  assert(
    `${propertyName} has invalid value: ${String(value)} (maybe not injected?)`,
    condition(value)
  );
}
