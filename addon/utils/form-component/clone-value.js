/**
 * Clones form values (especially whole values trees). Cloning strategy:
 * - value containers are cloned into new value containers,
 * - all other values are copied "as is", without cloning.
 *
 * Above approach allows to preserve the same references to objects across
 * multiple value clones which is especially handy in terms of Ember Data models
 * and diff analysis.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, set } from '@ember/object';
import {
  createValuesContainer,
  isValuesContainer,
} from 'onedata-gui-common/utils/form-component/values-container';

/**
 * @param {unknown} value
 * @returns {unknown}
 */
export default function cloneValue(value) {
  if (isValuesContainer(value)) {
    return cloneValuesContainer(value);
  } else {
    return value;
  }
}

/**
 * @param {Utils.FormComponent.ValuesContainer} obj
 * @returns {Utils.FormComponent.ValuesContainer}
 */
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
