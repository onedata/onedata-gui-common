/**
 * Creates comparator function in sorting, which compares object by its
 * properties using greater than and lower than operators (>, <).
 * 
 * @module utils/create-property-comparator
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

export default function createPropertyComparator(propertyName) {
  return function (a, b) {
    const ai = get(a, propertyName);
    const bi = get(b, propertyName);
    if (ai < bi) {
      return -1;
    } else if (ai > bi) {
      return 1;
    } else {
      return 0;
    }
  }
}
