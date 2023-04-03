/**
 * Allows loading external libraries. Depends on libraries specification taken from
 * application configuration (under `dynamicLibraries` key). When library has been
 * loaded successfully, it is cached so any subsequent requests for that library
 * can be resolved immediately.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/* eslint no-restricted-globals: ["error", "window"] */

import Service from '@ember/service';
import { get, computed } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import config from 'ember-get-config';
import {
  Promise,
  all as allFulfilled,
  resolve,
  reject,
} from 'rsvp';
import _ from 'lodash';
import { promise } from 'ember-awesome-macros';
import $ from 'jquery';

export default Service.extend({
  /**
   * @private
   * @type {Map<string, PromiseObject<Object|Function|null>>}
   */
  librariesProxiesMap: undefined,

  /**
   * @private
   * @type {string}
   */
  assetsMapLocation: 'assets/assetMap.json',

  /**
   * @private
   * @type {Object}
   */
  librariesSpec: _.cloneDeep(config.dynamicLibraries || {}),

  /**
   * @private
   * @type {Window}
   */
  /* eslint-disable-next-line no-restricted-globals */
  window,

  /**
   * @private
   * @type {ComputedProperty<PromiseObject<Object>>}
   */
  assetsMapProxy: promise.object(
    computed('assetsMapLocation', function assetsMapProxy() {
      // Only production build has assets map
      if (config.environment !== 'production') {
        return resolve({
          assets: {},
        });
      }

      const assetsMapLocation = this.get('assetsMapLocation');
      return resolve($.ajax(assetsMapLocation))
        .catch(() => reject(new Error(
          `Cannot load assets map: cannot fetch "${assetsMapLocation}".`
        )));
    })
  ),

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
    const filesPromises = [];
    librarySpec.files.forEach(({ destinationPath }) =>
      filesPromises.push(this.fetchScript(libraryName, destinationPath))
    );
    await allFulfilled(filesPromises);
    const exportName = librarySpec.exportName || libraryName;
    return window[exportName];
  },

  /**
   * @private
   * @param {string} libraryName
   * @param {string} path
   * @returns {Promise<void>}
   */
  async fetchScript(libraryName, path) {
    const window = this.get('window');
    const scriptNode = window.document.createElement('script');
    scriptNode.src = await this.getAssetPathToLoad(path);
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

  /**
   * @private
   * @param {string} path
   * @returns {Promise<string>}
   */
  async getAssetPathToLoad(path) {
    const assetsMap = await this.get('assetsMapProxy');
    if (!assetsMap || !assetsMap.assets || !(path in assetsMap.assets)) {
      return path;
    }

    let pathToLoad = assetsMap.assets[path];
    if (config.environment === 'test' && !pathToLoad.startsWith('/')) {
      pathToLoad = `/${pathToLoad}`;
    }
    return pathToLoad;
  },
});
