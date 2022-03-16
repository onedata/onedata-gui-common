/**
 * Clones form values (especially whole values trees). Cloning strategy:
 * - value containers are clone into new value containers,
 * - arrays and raw JS objects/values are cloned deeply as well,
 * - Ember objects, which are not value containers, are preserved without cloning.
 *
 * Ember objects are preserved to avoid problems with copying objects like Ember
 * Data models etc.
 *
 * @module utils/form-component/clone-value
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, set } from '@ember/object';
import { typeOf } from '@ember/utils';
import { isArray } from '@ember/array';
import ValuesContainer, { isValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

export default function cloneValue(value) {
  if (isValuesContainer(value)) {
    return cloneValuesContainer(value);
  } else if (typeOf(value) === 'instance') {
    return value;
  } else if (isArray(value)) {
    return cloneArray(value);
  } else if (value && typeof value === 'object') {
    return cloneObject(value);
  } else {
    return value;
  }
}

function cloneValuesContainer(obj) {
  const container = ValuesContainer.create();

  for (const key of Object.keys(obj)) {
    const value = get(obj, key);
    if (typeof value !== 'function') {
      set(container, key, cloneValue(value));
    }
  }

  return container;
}

function cloneObject(obj) {
  const newObj = {};

  for (const key of Object.keys(obj)) {
    const value = get(obj, key);
    if (typeof value !== 'function') {
      newObj[key] = cloneValue(value);
    }
  }

  return newObj;
}

function cloneArray(arr) {
  return [...arr];
}
