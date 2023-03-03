// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * Replace properites of destination EmberObject with properties
 * of source object.
 * It will remove all properties of destination that are not present in source!
 * If property value is equals deeply in source and destination then leave original
 * value - this prevents changing object references in properties.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import { get, set, computed } from '@ember/object';
import plainCopy from 'onedata-gui-common/utils/plain-copy';
import { typeOf } from '@ember/utils';

// fake, empty computed. Used only for detection of computed properties
const fakeComputed = computed(() => {});

/**
 * @export
 * @param {Ember.Object} dest
 * @param {Object|Ember.Object} source
 * @returns {Ember.Object} returns source with modified properties
 */
export default function emberObjectReplace(dest, source) {
  if (typeOf(source) === 'instance') {
    source = plainCopy(source);
  }
  const copy = _.clone(source);
  Object.keys(dest).forEach(k => {
    if (copy.hasOwnProperty(k)) {
      const newPropertyValue = copy[k];
      const origPropertyValue = get(dest, k);
      // TODO: deep properties copy
      if (!_.isEqual(origPropertyValue, newPropertyValue)) {
        set(dest, k, copy[k]);
      }
      delete copy[k];
    } else {
      set(dest, k, undefined);
    }
  });
  for (const k in copy) {
    // do not copy value to computed property. Let it recalculate on its own
    if (!dest[k] || dest[k].constructor !== fakeComputed.constructor) {
      set(dest, k, copy[k]);
    }
  }
  return dest;
}
