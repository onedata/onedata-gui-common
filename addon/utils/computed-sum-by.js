/**
 * Computes sum of objects values by property.
 *
 * Special cases:
 * - if array is empty, the sum is 0,
 * - if one of element in array is null, the sum is also null.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import _ from 'lodash';

/**
 * @param {string} arrayPropertyName
 * @param {string} nestedPropertyName
 * @returns {number|null}
 */
export default function computedSumBy(arrayPropertyName, nestedPropertyName) {
  return computed(`${arrayPropertyName}.@each.${nestedPropertyName}`, function () {
    const array = this?.[arrayPropertyName];
    if (!array?.length) {
      return 0;
    }
    const values = array
      .map(object => get(object, nestedPropertyName))
      .filter(value => typeof value === 'number' || value === null);
    if (values.includes(null)) {
      return null;
    }
    return _.sum(values);
  });
}
