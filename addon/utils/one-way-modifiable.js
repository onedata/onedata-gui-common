/**
 * Util that creates oneWay-like computed property. It can be temporary modified. 
 * Every such modification will be lost on computed field recalculation.
 *
 * @module utils/one-way-modifiable
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

export default function oneWayModifiable() {
  const args = arguments;
  const fields = Array.prototype.slice.call(args, 0, args.length - 1);
  return computed(...fields, {
    get(key) {
      return args[fields.length].call(this, key);
    },
    set(key, value) {
      return value;
    },
  });
}
