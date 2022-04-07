// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable valid-jsdoc */

/**
 * Copy properites from source to destination EmberObject, overwriting
 * properties that are both in source and desitination.
 *
 * @module utils/ember-object-merge
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';
import plainCopy from 'onedata-gui-common/utils/plain-copy';
import { setProperties } from '@ember/object';

/**
 * @export
 * WARNING: it will make plain objects from nested Ember Objects!
 * @param {Ember.Object} dest
 * @param {Ember.Object} source
 * @returns {Ember.Object} returns source with modified properties
 */
export default function emberObjectMerge(dest, source, deep = true) {
  const destData = plainCopy(dest, deep);
  const sourceData = plainCopy(source, deep);
  setProperties(dest, _.merge(destData, sourceData));
  return dest;
}
