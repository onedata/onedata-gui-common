/**
 * Checks if the value retrieved by key from the host object is included in the array from
 * the host object.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function includes(arrayPropertyKey, valuePropertyKey) {
  if (!arrayPropertyKey || !valuePropertyKey) {
    return false;
  }

  return computed(
    `${arrayPropertyKey}.[]`,
    function includes() {
      const array = this[arrayPropertyKey];
      if (!array?.length) {
        return true;
      }
      const value = this[arrayPropertyKey];
      return array.includes(value);
    }
  );
}
