/**
 * Util that creates oneWay-like computed property. It can be temporary modified.
 * Every such modification will be lost on computed field recalculation.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function oneWayModifiable(fieldName) {
  return computed(fieldName, {
    get() {
      return this.get(fieldName);
    },
    set(key, value) {
      return value;
    },
  });
}
