/**
 * A macro, that checks whether all object in collection have the same value in
 * specified property. If collection is empty or field name is not specified,
 * returns true.
 *
 * Example usage: `isEveryTheSame('collectionFieldName', 'fieldName')`
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import computed from 'ember-macro-helpers/computed';
import { get } from '@ember/object';

export default function isEveryTheSame(arrayPropName, rawArrayItemPropName) {
  if (!arrayPropName || !rawArrayItemPropName) {
    return true;
  }

  return computed(
    `${arrayPropName}.@each.${rawArrayItemPropName}`,
    function isEveryTheSame() {
      const arr = this[arrayPropName];
      if (!arr?.length) {
        return true;
      } else {
        const compareVal = get(arr.objectAt(0), rawArrayItemPropName);
        return arr.isEvery(rawArrayItemPropName, compareVal);
      }
    }
  );
}
