/**
 * Gets property value of object using property path.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { get } from '@ember/object';

export default function propertyValue(objectKey, objectPropertyKey) {
  if (!objectKey) {
    return undefined;
  }

  return computed(
    `${objectKey}.${objectPropertyKey}`,
    function propertyValue() {
      const object = this[objectKey];
      if (!object || typeof object !== 'object') {
        return undefined;
      }
      return get(object, objectPropertyKey);
    }
  );
}
