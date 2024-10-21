/**
 * Check if every value of the object in the array at the given `nestedPropertyName` is:
 * - equal to the `checkedValue` - if the `checkedValue` is provided,
 * - is truthy - if the `checkedValue` is not provided.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';

const noCheckedValue = {};

/**
 * @param {string} arrayPropertyName
 * @param {string} nestedPropertyName
 * @param {any} [checkedValue] Check if every value in the object property is the same as
 *   this value. If not provided - check if the value is truthy.
 * @returns {number|null}
 */
export default function computedIsEvery(
  arrayPropertyName,
  nestedPropertyName,
  checkedValue = noCheckedValue
) {
  return computed(`${arrayPropertyName}.@each.${nestedPropertyName}`, function () {
    const array = this?.[arrayPropertyName];
    if (!array?.length) {
      return 0;
    }
    const values = array.map(object => get(object, nestedPropertyName));
    if (checkedValue === noCheckedValue) {
      return values.every(value => value);
    } else {
      return values.every(value => value === checkedValue);
    }
  });
}
