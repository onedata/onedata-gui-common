/**
 * Exposes parent application proxy API (available through
 * window.frameElement.appProxy)
 *
 * @module services/app-proxy
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import EmberObject, { computed, set } from '@ember/object';
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

  init() {
    this._super(...arguments);

    const appProxy = this.get('appProxy');
    if (appProxy) {
      set(appProxy, 'propertyChanged', this.propertyChanged.bind(this));
    }
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

  /**
   * Handler for sharedProperties field changed event
   * @param {string} propertyName 
   * @returns {undefined}
   */
  propertyChanged(propertyName) {
    this.set(
      `injectedData.${propertyName}`,
      getSharedProperty(this.get('appProxy'), propertyName)
    );
  },
});
