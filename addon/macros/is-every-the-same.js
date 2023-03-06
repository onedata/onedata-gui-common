/**
 * A macro, that checks whether all object in collection have the same value in
 * specified property. If collection is empty or field name is not specified,
 * returns true.
 *
 * Example usage: `isEveryTheSame('collectionFieldName', raw('fieldName'))`
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import createClassComputed from 'ember-macro-helpers/create-class-computed';
import computed from 'ember-macro-helpers/computed';
import { get } from '@ember/object';

export default createClassComputed([false, true], (arr, key) => {
  return computed(`${arr}.@each.${key}`, (arr) => {
    if (!arr || !arr.length || !key) {
      return true;
    } else {
      const compareVal = get(arr.objectAt(0), key);
      return arr.isEvery(key, compareVal);
    }
  });
});
