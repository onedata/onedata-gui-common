/**
 * Sort by properties like the `computed.sort` from Ember.
 * Ported from:
 * https: //github.com/emberjs/ember.js/blob/v2.18.0/packages/ember-runtime/lib/computed/reduce_computed_macros.js
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { A } from '@ember/array';
import { get } from '@ember/object';
import { compare } from '@ember/utils';

/**
 * This function sorts the `items` array of objects by properties using order
 * specified in `sortProperties` and returns new Ember Array.
 * See http://api.emberjs.com/ember/3.8/functions/@ember%2Fobject%2Fcomputed/sort
 * @param {Array<object>} items
 * @param {Array<string>} sortProperties
 * @returns {EmberArray<object>}
 */
export default function emberSortByProperties(items, sortProperties) {
  return sortByNormalizedSortProperties(items, normalizeSortProperties(sortProperties));
}

function normalizeSortProperties(sortProperties) {
  return sortProperties.map(p => {
    let [prop, direction] = p.split(':');
    direction = direction || 'asc';

    return [prop, direction];
  });
}

function sortByNormalizedSortProperties(items, normalizedSortProperties) {
  return A(items.slice().sort((itemA, itemB) => {
    for (let i = 0; i < normalizedSortProperties.length; i++) {
      const [prop, direction] = normalizedSortProperties[i];
      const result = compare(get(itemA, prop), get(itemB, prop));
      if (result !== 0) {
        return (direction === 'desc') ? (-1 * result) : result;
      }
    }
    return 0;
  }));
}
