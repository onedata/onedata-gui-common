// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * Sorts the (Ember) objects of array in place by given property and place
 * default object in first place of array using entityId (if present).
 *
 * @module utils/sort-by-property-or-default
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

/**
 *
 * @param {Array<any>} array
 * @param {string} defaultEntityId
 * @param {string} [property]
 */
export default function sortByPropertyOrDefault(array, defaultEntityId, property = 'name') {
  return array.sort((a, b) => {
    if (get(a, 'entityId') === defaultEntityId) {
      return -1;
    } else if (get(b, 'entityId') === defaultEntityId) {
      return 1;
    } else {
      const aVal = get(a, property);
      const bVal = get(b, property);
      if (aVal < bVal) {
        return -1;
      } else if (aVal === bVal) {
        return 0;
      } else {
        return 1;
      }
    }
  });

}
