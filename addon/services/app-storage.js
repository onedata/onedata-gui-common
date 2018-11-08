/**
 * A service that acts as an per-app-instance storage. It is cleared every
 * app reload.
 * 
 * WARNING: data stored in app-storage is not persisted! It is only stored in memory.
 *
 * @module services/app-storage
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import EmberObject, { computed, get, set } from '@ember/object';

export default Service.extend({
  /**
   * Storage object. Provides key -> value mapping where key is a field name
   * in `data` object.
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  data: computed(function data() {
    return EmberObject.create();
  }),

  /**
   * Gets data stored under given key.
   * @param {string} key 
   * @returns {any}
   */
  getData(key) {
    return this.get(`data.${key}`);
  },

  /**
   * Sets data - stores value under given key. Creates nested objects to
   * satisfy (possibly nested) given key.
   * @param {string} key 
   * @param {any} value 
   * @return {any} value
   */
  setData(key, value) {
    const pathElementsNames = key.split('.');
    const lastPathElementName = pathElementsNames.pop();
    let pathElement = this.get('data');
    pathElementsNames.forEach(nextPathElementName => {
      let nextPathElement = get(pathElement, nextPathElementName);
      if (!nextPathElement) {
        nextPathElement = EmberObject.create();
        set(pathElement, nextPathElementName, nextPathElement);
      }
      pathElement = nextPathElement;
    });
    return set(pathElement, lastPathElementName, value);
  },
});
