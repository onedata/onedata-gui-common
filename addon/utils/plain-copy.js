// Original implementation: http://stackoverflow.com/a/15002755

import Ember from 'ember';

// TODO: WARNING this function does not clone object deeply, 
// it will just return always a plain object

/**
 * Somehow hacky method to check if object is Ember Object
 * @param {object|Ember.Object} obj
 * @returns {boolean} true if obj is Ember.Object
 */
function isEmberObject(obj) {
  return obj.reopen !== undefined;
}

function emberObjPlainCopy(emberObj) {
  var props = Object.keys(emberObj);
  var proto = emberObj.constructor.prototype;
  for (let p in proto) {
    if (proto.hasOwnProperty(p) && typeof (emberObj[p]) !== 'function') {
      props.push(p);
    }
  }
  var copy = {};
  props.forEach(function (p) {
    copy[p] = plainCopy(emberObj.get(p));
  }, emberObj);
  return copy;
}

export default function plainCopy(obj) {
  if (Ember.isArray(obj)) {
    return obj.map(plainCopy);
  } else if (typeof (obj) === 'object') {
    if (isEmberObject(obj)) {
      return emberObjPlainCopy(obj);
    } else {
      return obj;
    }
  } else {
    return obj;
  }
}
