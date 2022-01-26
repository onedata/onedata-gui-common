/**
 * Allows loading external libraries. Depends on libraries specification taken from
 * application configuration (under `dynamicLibraries` key). When library has been
 * loaded successfully, it is cached so any subsequent requests for that library
 * can be resolved immediately.
 *
 * @module services/libraries-loader
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { get } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import config from 'ember-get-config';
import { Promise, all as allFulfilled } from 'rsvp';

const librariesSpec = config.dynamicLibraries || {};

export default Service.extend({
  /**
   * @private
   * @type {Map<string,PromiseObject<Object|Function|null>>}
   */
  librariesProxiesMap: undefined,

  /**
   * @private
   * @type {Object}
   */
  librariesSpec,

  /**
   * @private
   * @type {Window}
   */
  window,

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.set('librariesProxiesMap', new Map());
  },

  /**
   * @public
   * @param {string} libraryName
   * @returns {PromiseObject<Object|Function|null>}
   */
  loadLibrary(libraryName) {
    const libraryProxy = this.getLibraryProxy(libraryName);
    if (libraryProxy) {
      return libraryProxy;
    }

    const newLibraryProxy = promiseObject(this.fetchLibrary(libraryName));
    this.setLibraryProxy(libraryName, newLibraryProxy);
    return newLibraryProxy;
  },

  /**
   * @public
   * @param {string} libraryName
   * @returns {Object|Function|null}
   */
  peekLibrary(libraryName) {
    const libraryProxy = this.getLibraryProxy(libraryName);
    return libraryProxy && get(libraryProxy, 'content') || null;
  },

  /**
   * @private
   * @param {string} libraryName
   * @returns {PromiseObject<Object|Function|null>|null}
   */
  getLibraryProxy(libraryName) {
    return this.get('librariesProxiesMap').get(libraryName) || null;
  },

  /**
   * @private
   * @param {string} libraryName
   * @param {PromiseObject<Object|Function|null>} proxy
   */
  setLibraryProxy(libraryName, proxy) {
    this.get('librariesProxiesMap').set(libraryName, proxy);
  },

  /**
   * @private
   * @param {string} libraryName
   * @returns {Promise<Object|Function|null>}
   */
  async fetchLibrary(libraryName) {
    const {
      librariesSpec,
      window,
    } = this.getProperties('librariesSpec', 'window');
    const librarySpec = librariesSpec[libraryName];
    if (!librarySpec || !librarySpec.files || !librarySpec.files.length) {
      throw new Error(`Cannot load library "${libraryName}": there are no files to load.`);
    }
    let filesPromises = [];
    librarySpec.files.forEach(({ destinationPath }) =>
      filesPromises.push(this.fetchScript(libraryName, destinationPath))
    );
    await allFulfilled(filesPromises);
    return window[libraryName];
  },

  /**
   * @private
   * @param {string} libraryName
   * @param {string} path
   * @returns {Promise<void>}
   */
  fetchScript(libraryName, path) {
    const window = this.get('window');
    const scriptNode = window.document.createElement('script');
    let normalizedPath = path;
    if (config.environment === 'test' && !path.startsWith('/')) {
      normalizedPath = `/${normalizedPath}`;
    }
    scriptNode.src = normalizedPath;
    const loadingPromise = new Promise((resolve, reject) => {
      scriptNode.addEventListener('load', () => resolve());
      scriptNode.addEventListener('error', (event) => {
        console.error(
          'service:libraries-loader#fetchScript: library loading error occurred',
          event
        );
        reject(new Error(
          `Cannot load library "${libraryName}": cannot fetch "${path}".`
        ));
      });
    });
    window.document.getElementsByTagName('body')[0].appendChild(scriptNode);
    return loadingPromise;
  },
});
