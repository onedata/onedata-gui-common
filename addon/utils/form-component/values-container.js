/**
 * This class should be used to contain grouped form values. All nodes
 * in form values tree should be value containers except fields values.
 *
 * In normal usage ValueContainer should be used when we want to define value
 * for the whole form group.
 *
 * @module utils/form-component/values-container
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { defineProperty } from '@ember/object';
import { typeOf } from '@ember/utils';

const isValuesContainerFlag = '__isFormValuesContainer';

export default EmberObject.extend({
  init() {
    this._super(...arguments);
    defineProperty(this, isValuesContainerFlag, {
      writable: false,
      configurable: false,
      enumerable: false,
      value: true,
    });
  },
});

/**
 * @param {unknown} obj
 * @returns {boolean}
 */
export function isValuesContainer(obj) {
  return Boolean(typeOf(obj) === 'instance' && obj[isValuesContainerFlag]);
}
