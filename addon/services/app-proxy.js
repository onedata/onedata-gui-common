/**
 * Exposes parent application proxy API (available through
 * window.frameElement.appProxy)
 *
 * # Navigation properties
 *
 * Some properties can be considered as "navigation properties".
 * Such properties behave like routing parameters - every change
 * to them defines what place of the GUI is visible to a user.
 * Having such information can be handful when trying to react
 * globally to any transition-like event - you'll have to use
 * app proxy properties change listener and the current list of
 * navigation properties.
 *
 * The list of navigation properties is not constant - it depends on the
 * current context of the GUI. Hence app proxy has methods
 * `registerNavigationProperties` and `unregisterNavigationProperties`
 * which are responsible for marking specific properties as navigational
 * from the outside. Registrations are counted - two registrations
 * of some property will need two unregistrations to make that property
 * non-navigational.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import EmberObject, {
  computed,
  set,
  observer,
  setProperties,
} from '@ember/object';
import {
  sharedObjectName,
  sharedDataPropertyName,
  getSharedProperty,
} from 'onedata-gui-common/utils/one-embedded-common';
import createThrottledFunction from '../utils/create-throttled-function';
import { defer } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';

export const throttleTimeout = 50;

/**
 * @typedef {Object} AppProxyPropertyChangeEvent
 * @property {Object<string, { prevValue: unknown, newValue: unknown }>} changedProperties
 */

/**
 * @typedef {(event: AppProxyPropertyChangeEvent) => void} AppProxyPropertyChangeListener
 */

export default Service.extend({
  /**
   * Accumulates shared properties that should be read from `appProxy`
   * collectively and set collectively with throttling.
   * @type {Set}
   */
  propertiesToChange: undefined,

  /**
   * Deferred object used to hold state and notify about flush.
   * @type {Object} RSVP's Deferred object
   */
  flushDefer: null,

  /**
   * Map (property name) -> (number of times that property was marked
   * as navigation property). `0` or lack of property means no mark for specific
   * property. See documentation at the top of the file for more information.
   * @type {Map<string, number>}
   */
  navigationPropertyMarksCounter: undefined,

  /**
   * @type {Set<AppProxyPropertyChangeListener>}
   */
  propertyChangeListeners: undefined,

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  appProxy: computed(() => globals.window.frameElement?.[sharedObjectName]),

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
    }, throttleTimeout, false);
    this.setProperties({
      navigationPropertyMarksCounter: new Map(),
      propertyChangeListeners: new Set(),
    });
  },

  /**
   * Calls action in parent application
   * @public
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
   * Marks provided properties as navigation properties.
   * @public
   * @param {Array<string>} propertyNameArray
   * @returns {void}
   */
  registerNavigationProperties(propertyNameArray) {
    propertyNameArray.forEach((propertyName) => {
      this.navigationPropertyMarksCounter.set(
        propertyName,
        (this.navigationPropertyMarksCounter.get(propertyName) ?? 0) + 1
      );
    });
  },

  /**
   * Unmarks provided properties from being navigation properties.
   * @public
   * @param {Array<string>} propertyNameArray
   * @returns {void}
   */
  unregisterNavigationProperties(propertyNameArray) {
    propertyNameArray.forEach((propertyName) => {
      const currentMarksCount = this.navigationPropertyMarksCounter.get(propertyName);
      if (currentMarksCount) {
        this.navigationPropertyMarksCounter.set(
          propertyName,
          currentMarksCount - 1
        );
      }
    });
  },

  /**
   * @public
   * @returns {Array<string>}
   */
  getNavigationProperties() {
    const navigationProperties = [];
    for (const [propName, counter] of this.navigationPropertyMarksCounter) {
      if (counter > 0) {
        navigationProperties.push(propName);
      }
    }
    return navigationProperties;
  },

  /**
   * @public
   * @property {AppProxyPropertyChangeListener} listener
   * @return {void}
   */
  registerPropertyChangeListener(listener) {
    this.propertyChangeListeners.add(listener);
  },

  /**
   * @public
   * @property {AppProxyPropertyChangeListener} listener
   * @return {void}
   */
  unregisterPropertyChangeListener(listener) {
    this.propertyChangeListeners.delete(listener);
  },

  /**
   * @public
   * @returns {Promise}
   */
  waitForNextFlush() {
    this.scheduleFlushCache();
    return this.getFlushPromise();
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
    } = this.getProperties(
      'injectedData',
      'propertiesToChange',
      'appProxy',
    );
    this.clearPropertiesToChangeCache();
    const newData = {};
    const changeEvent = {
      changedProperties: {},
    };

    for (const propertyName of propertiesToChange.values()) {
      const newValue = getSharedProperty(appProxy, propertyName);
      newData[propertyName] = newValue;
      changeEvent.changedProperties[propertyName] = {
        prevValue: injectedData[propertyName],
        newValue,
      };
    }

    setProperties(
      injectedData,
      newData
    );
    this.resolveFlushDefer();

    this.propertyChangeListeners.forEach((listener) => listener(changeEvent));
  },

  clearPropertiesToChangeCache() {
    this.set('propertiesToChange', new Set());
  },

  getFlushPromise() {
    let flushDefer = this.get('flushDefer');
    if (!flushDefer) {
      flushDefer = this.set('flushDefer', defer());
    }
    return flushDefer.promise;
  },

  resolveFlushDefer() {
    const flushDefer = this.get('flushDefer');
    if (flushDefer) {
      flushDefer.resolve();
      this.set('flushDefer', null);
    }
  },
});
