/**
 * Exposes parent application proxy API (available through
 * window.frameElement.appProxy)
 *
 * @module services/app-proxy
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import EmberObject, { computed, set, setProperties, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  sharedObjectName,
  sharedDataPropertyName,
  getSharedProperty,
} from 'onedata-gui-common/utils/one-embedded-common';

export default Service.extend({
  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  appProxy: reads(`_window.frameElement.${sharedObjectName}`),

  /**
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  injectedData: computed(function injectedData() {
    const sharedData = this.get(`appProxy.${sharedDataPropertyName}`) || {};
    return EmberObject.create(sharedData);
  }),

  appProxyObserver: observer('appProxy', function appProxyObserver() {
    const appProxy = this.get('appProxy');
    if (appProxy) {
      // TODO: VFS-8360: do not add deprecated method
      set(appProxy, 'propertyChanged', this.propertyChanged.bind(this));
      set(appProxy, 'propertiesChanged', this.propertiesChanged.bind(this));
    }
  }),

  init() {
    this._super(...arguments);
    this.appProxyObserver();
  },

  /**
   * Calls action in parent application
   * @param {string} methodName 
   * @param  {Array<any>} args 
   * @returns {any}
   */
  callParent(methodName, ...args) {
    const callParentCallback = this.get('appProxy.callParent');
    if (typeof callParentCallback === 'function') {
      return callParentCallback(methodName, ...args);
    }
  },

  // TODO: VFS-8360: remove deprecated method
  /**
   * Handler for sharedProperties field changed event
   * @deprecated Support for legacy Onezone's - will be removed in future releases
   * @param {string} propertyName 
   * @returns {undefined}
   */
  propertyChanged(propertyName) {
    console.warn(
      'DEPRECATED: appProxy#propertyChanged will be removed; please use propertiesChanged'
    );
    this.set(
      `injectedData.${propertyName}`,
      getSharedProperty(this.get('appProxy'), propertyName)
    );
  },

  propertiesChanged(propertiesNames) {
    const {
      appProxy,
      injectedData,
    } = this.getProperties('appProxy', 'injectedData');
    const updatedData = propertiesNames.reduce((data, propertyName) => {
      data[propertyName] = getSharedProperty(appProxy, propertyName);
      return data;
    }, {});
    setProperties(
      injectedData,
      updatedData,
    );
  },
});
