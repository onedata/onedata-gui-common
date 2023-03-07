/**
 * Clones deep passed object using Ember structures (EmberObject and Ember.A).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { get, set } from '@ember/object';
import { A, isArray } from '@ember/array';

export default function cloneAsEmberObject(obj) {
  const emberObj = EmberObject.create();

  for (const key in obj) {
    const value = get(obj, key);
    if (typeof value !== 'function') {
      set(emberObj, key, cloneValue(value));
    }
  }

  return emberObj;
}

function cloneValue(value) {
  if (isArray(value)) {
    return A(value.map(item => cloneValue(item)));
  } else if (typeof value === 'object' && value !== null) {
    return cloneAsEmberObject(value);
  } else {
    return value;
  }
}
