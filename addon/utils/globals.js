/**
 * Allows to access global objects without using the global scope. It enables
 * possibility to mock these global objects in tests (and only in tests!).
 *
 * `Globals` is intended to be a singleton. You should use the already created
 * instance exported from this module.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import config from 'ember-get-config';

/**
 * @typedef {'window' | 'document' | 'location' | 'navigator' | 'localStorage' | 'sessionStorage' | 'fetch'} GlobalName
 */

const isTestingEnv = config.environment === 'test';

export class Globals {
  /**
   * @public
   * @type {Window}
   */
  get window() {
    return this.getGlobal('window');
  }

  /**
   * @public
   * @type {Document}
   */
  get document() {
    return this.getGlobal('document');
  }

  /**
   * @public
   * @type {Location}
   */
  get location() {
    return this.getGlobal('location');
  }

  /**
   * @public
   * @type {Navigator}
   */
  get navigator() {
    return this.getGlobal('navigator');
  }

  /**
   * @public
   * @type {Storage}
   */
  get localStorage() {
    return this.getGlobal('localStorage');
  }

  /**
   * @public
   * @type {Storage}
   */
  get sessionStorage() {
    return this.getGlobal('sessionStorage');
  }

  /**
   * @public
   * @type {typeof fetch}
   */
  get fetch() {
    return this.getGlobal('fetch');
  }

  /**
   * @public
   * @type {Window}
   */
  get nativeWindow() {
    return this.getNativeGlobal('window');
  }

  /**
   * @public
   * @type {Document}
   */
  get nativeDocument() {
    return this.getNativeGlobal('document');
  }

  /**
   * @public
   * @type {Location}
   */
  get nativeLocation() {
    return this.getNativeGlobal('location');
  }

  /**
   * @public
   * @type {Navigator}
   */
  get nativeNavigator() {
    return this.getNativeGlobal('navigator');
  }

  /**
   * @public
   * @type {Storage}
   */
  get nativeLocalStorage() {
    return this.getNativeGlobal('localStorage');
  }

  /**
   * @public
   * @type {Storage}
   */
  get nativeSessionStorage() {
    return this.getNativeGlobal('sessionStorage');
  }

  /**
   * @public
   * @type {typeof fetch}
   */
  get nativeFetch() {
    return this.getNativeGlobal('fetch');
  }

  /**
   * @public
   */
  constructor() {
    /**
     * @private
     * @type {Object<GlobalName, unknown>}
     */
    this.mocks = {};
  }

  /**
   * @public
   * @param {GlobalName} globalName
   * @param {unknown} mock
   * @returns {void}
   */
  mock(globalName, mock) {
    if (config.environment !== 'test') {
      throw new Error(
        `Mocking global object ${globalName} in a non-testing environment is not allowed.`
      );
    }

    const nativeGlobal = this.getNativeGlobal(globalName);
    if (typeof nativeGlobal === 'object') {
      // Cannot use `nativeGlobal` directly as a target of the proxy, because
      // some globals have properties (like location.reload) which cannot be
      // mocked due to limitations of proxies on read-only fields. Using native
      // global directly will cause errors like:
      // ```
      // xyz is a read-only and non-configurable data property on the proxy
      // target but the proxy did not return its actual value
      // ```
      this.mocks[globalName] = new Proxy({}, {
        get(target, propertyName) {
          if (propertyName in mock) {
            return mock[propertyName];
          } else {
            const nativeValue = nativeGlobal[propertyName];
            return typeof nativeValue === 'function' ?
              nativeValue.bind(nativeGlobal) : nativeValue;
          }
        },
        set(target, propertyName, value) {
          if (propertyName in mock) {
            mock[propertyName] = value;
          } else {
            nativeGlobal[propertyName] = value;
          }
          return true;
        },
      });
    } else {
      this.mocks[globalName] = mock;
    }
  }

  /**
   * @public
   * @param {GlobalName} [globalName] If not provided, all mocked globals will
   *   be unmocked.
   * @returns {void}
   */
  unmock(globalName) {
    if (globalName) {
      delete this.mocks[globalName];
    } else {
      this.mocks = {};
    }
  }

  /**
   * @private
   * @param {GlobalName} globalName
   * @returns {unknown}
   */
  getGlobal(globalName) {
    if (isTestingEnv && this.mocks[globalName]) {
      return this.mocks[globalName];
    }

    return this.getNativeGlobal(globalName);
  }

  /**
   * @private
   * @param {GlobalName} globalName
   * @returns {unknown}
   */
  getNativeGlobal(globalName) {
    /* eslint-disable-next-line no-restricted-globals */
    return window[globalName];
  }
}

const globalsInstance = new Globals();
export default globalsInstance;
