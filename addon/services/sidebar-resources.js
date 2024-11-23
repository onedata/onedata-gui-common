/**
 * @abstract To implement in specific projects
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Service from '@ember/service';
import { Promise } from 'rsvp';
import { camelize, dasherize } from '@ember/string';

// FIXME: sprawdzić, czy isRecord jest nadal używane

/**
 * @typedef {Object} SidebarCollection
 * @property {Array<ResorceT>} array
 * @property {Array<string>} ids
 */

export default Service.extend({
  /**
   * @type {Map<String,String>}
   */
  modelNameToRouteResourceTypeMapping: Object.freeze(new Map()),

  /**
   * @type {Ember.ComputedProperty<Map<String,String>>}
   */
  routeResourceTypeToModelNameMapping: computed(
    'modelNameToRouteResourceTypeMapping',
    function routeResourceTypeToModelNameMapping() {
      const modelNameToRouteResourceTypeMapping =
        this.get('modelNameToRouteResourceTypeMapping');
      const routeResourceTypeMap = new Map();

      modelNameToRouteResourceTypeMapping.forEach((resourceType, modelName) =>
        routeResourceTypeMap.set(resourceType, modelName)
      );

      return routeResourceTypeMap;
    }
  ),

  /**
   * @virtual
   * @param {string} type
   * @returns {Promise<SidebarCollection>}
   */
  async getCollectionFor( /* type */ ) {
    throw new Error('service:sidebar-resources: not implemented');
  },

  /**
   * Returns Promise ready to be consumed by sidebar
   * @param {string} resourceType
   * @returns {Promise<OnedataSidebarRouteModel>}
   */
  async getSidebarModelFor(resourceType) {
    const collection = await this.getCollectionFor(resourceType);
    await Promise.all(collection.array);
    return {
      resourceType,
      collection,
    };
  },

  /**
   * @param {string} resourceType
   * @returns {Array<string>}
   */
  getItemsSortingFor(resourceType) {
    if (resourceType === 'clusters') {
      return ['type:desc', 'name'];
    } else {
      return ['name'];
    }
  },

  /**
   * @param {string} type
   * @param {any} [context]
   * @returns {Array<Utils.Action>}
   */
  getButtonsFor( /* resourceType, context */ ) {
    return [];
  },

  /**
   * @param {string} resourceType
   * @returns {string}
   */
  getSidebarComponentNameFor(resourceType) {
    return `sidebar-${resourceType}`;
  },

  /**
   * Returns resource type (compatible with the one used in other methods of this
   * service) for given model name.
   * @param {String} modelName
   * @returns {String}
   */
  getRouteResourceTypeForModelName(modelName) {
    return this.get('modelNameToRouteResourceTypeMapping').get(modelName) ||
      `${dasherize(modelName)}s`;
  },

  /**
   * @param {String} resourceType
   * @returns {String}
   */
  getModelNameForRouteResourceType(resourceType) {
    return this.get('routeResourceTypeToModelNameMapping').get(resourceType) ||
      camelize(resourceType).replace(/s$/, '');
  },
});
