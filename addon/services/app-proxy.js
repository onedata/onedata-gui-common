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
import EmberObject, { computed, set, observer, setProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import {
  sharedObjectName,
  sharedDataPropertyName,
  getSharedProperty,
} from 'onedata-gui-common/utils/one-embedded-common';
import createThrottledFunction from '../utils/create-throttled-function';

export default Service.extend({
  /**
   * @type {Window}
   */
  _window: window,

  /**
   * Accumulates shared properties that should be read from `appProxy`
   * collectively and set collectively with throttling.
   * @type {Set}
   */
  propertiesToChange: undefined,

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
      set(appProxy, 'propertyChanged', this.propertyChanged.bind(this));
    }
  }),

  init() {
    this._super(...arguments);

    this.appProxyObserver();
    this.clearPropertiesToChangeCache();
    this.scheduleFlushCache = createThrottledFunction(() => {
      this.flushCache();
    }, 100, true);
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
    const propertiesToChange = this.get('propertiesToChange');
    propertiesToChange.add(propertyName);
    this.scheduleFlushCache();
  },

  flushCache() {
    const {
      injectedData,
      propertiesToChange,
      appProxy,
    } = this.getProperties('injectedData', 'propertiesToChange', 'appProxy');
    this.clearPropertiesToChangeCache();
    const sharedData = Array.from(propertiesToChange.values())
      .reduce((data, propertyName) => {
        data[propertyName] = getSharedProperty(appProxy, propertyName);
        return data;
      }, {});
    setProperties(
      injectedData,
      sharedData
    );
  },

  clearPropertiesToChangeCache() {
    this.set('propertiesToChange', new Set());
  },
});
