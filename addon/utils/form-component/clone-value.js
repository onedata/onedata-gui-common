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
import {
  createValuesContainer,
  isValuesContainer,
} from 'onedata-gui-common/utils/form-component/values-container';

export default function cloneValue(value) {
  if (isValuesContainer(value)) {
    return cloneValuesContainer(value);
  } else {
    return value;
  }
}

function cloneValuesContainer(obj) {
  const container = createValuesContainer();

  for (const key of Object.keys(obj)) {
    const value = get(obj, key);
    if (typeof value !== 'function') {
      set(container, key, cloneValue(value));
    }
  }

  return container;
}
