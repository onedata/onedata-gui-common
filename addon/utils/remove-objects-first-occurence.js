/**
 * Removes exactly one occurence of each value specified `objectsToRemove`
 * from `emberArray`, notifying about mutable array changes.
 * 
 * If there are multiple occurences of the same value on `objectsToRemove`, remove
 * one occurence from `emberArray` for each, eg.
 * 
 * ```js
 * removeObjectsFirstOccurence(A([a, a, b, b]), A([a, a, b]));
 * ```
 * 
 * will result in `A([b])` array, because there was two "a" in array and two "a" to
 * remove.
 * 
 * @module utils/remove-objects-first-occurence
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';

export default function removeObjectsFirstOccurence(emberArray, objectsToRemove) {
  emberArray.beginPropertyChanges();
  for (const objectToRemove of objectsToRemove) {
    let arrayIndex = get(emberArray, 'length') || 0;
    while (--arrayIndex >= 0) {
      const arrayObject = emberArray.objectAt(arrayIndex);
      if (arrayObject === objectToRemove) {
        emberArray.removeAt(arrayIndex);
        break;
      }
    }
  }
  emberArray.endPropertyChanges();
  return this;
}
