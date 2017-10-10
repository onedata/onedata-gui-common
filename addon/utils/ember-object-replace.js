import _ from 'lodash';
import { get, set } from '@ember/object';
import plainCopy from 'onedata-gui-common/utils/plain-copy';
import { typeOf } from '@ember/utils';

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
  for (let k in copy) {
    set(dest, k, copy[k]);
  }
  return dest;
}
