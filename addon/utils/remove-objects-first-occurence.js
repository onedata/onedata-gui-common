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
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default function removeObjectsFirstOccurence(emberArray, objectsToRemove) {
  emberArray.beginPropertyChanges();
  for (const objectToRemove of objectsToRemove) {
    const idxToRemove = emberArray.lastIndexOf(objectToRemove);
    if (idxToRemove !== -1) {
      emberArray.removeAt(idxToRemove);
    }
  }
  emberArray.endPropertyChanges();
  return emberArray;
}
