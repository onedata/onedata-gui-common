/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * This service should be implemented in GUIs that use the Onedata routing and display
 * GUI with tabs.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import sortByProperties from 'onedata-gui-common/utils/ember/sort-by-properties';
import globals from 'onedata-gui-common/utils/globals';
import { get, computed } from '@ember/object';
import { camelize } from '@ember/string';
import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

/**
 * @typedef {OnedataSidebarRouteModel<ResourceT>} Object
 * @property {OnedataResourceCategory} resourceType
 * @property {SidebarCollection<ResourceT>} collection
 */

/**
 * @typedef {OnedataContentRouteModel<ResourceT>} Object
 * @property {string} resourceId
 * @property {ResourceT} resource
 * @property {SidebarCollection<ResourceT>} collection
 * @property {Object} queryParams
 */

/**
 * @typedef {(sidebarModel?: OnedataSidebarRouteModel, contentModel?: OnedataContentRouteModel) => string|Promise<string>} DefaultAspectGetter
 */

/**
 * @typedef {(sidebarModel?: OnedataSidebarRouteModel) => string|Promise<string>} DefaultResourceGetter
 */

/**
 * @typedef OnedataTabModel
 * @property {string} id
 * @property {string} icon
 * @property {boolean} [isDefault] If true, then page under that menu item will be a
 *     default choice when URL does not specify selected menu item. Only one menu item can
 *     be default.
 * @property {string|DefaultAspectGetter} [defaultAspect] Aspect name, that should be
 *     rendered, when URL does not specify any.
 * @property {string|DefaultResourceGetter} [defaultResourceId] Resource ID (entityId),
 *     that should be rendered, when URL does not specify any.
 * @property {boolean} [allowIndex] If true and URL does not specify any resource, then
 *     router will allow showing page not related to any resource - index page for
 *     resource type of that menu item.
 * @property {boolean} [stickyBottom] If true, menu item will stick to the bottom edge of
 *     main-menu column (only in desktop mode) regardless scroll
 * @property {string} [visibilityCondition] String in format `serviceName.propertyName`,
 *     that will point to boolean value. If it will be true, then menu item will be
 *     visible, hidden otherwise. `propertyName` can represent a nested property in
 *     standard format `some.nested.property`.
 * @property {string} [component] Custom component name, that should be used to render
 *     menu item.
 */

/**
 * Maps resource ID (as in `OnedataContentRouteModel.resourceId`) to milliseconds
 * timestamp of last open in GUI.
 * @typedef {Object<string, number>} RecentlyUsedMap
 */

class CommonNavigationTabsConfiguration extends Service {
  @service sidebarResources;
  @service contentResources;

  defaultAspect = 'index';

  /** @type {Storage} */
  localStorage = globals.localStorage;

  /** @type {Storage} */
  sessionStorage = globals.sessionStorage;

  /** @type {OnedataSidebarRouteModel} */
  lastSidebarModel = undefined;

  /** @type {OnedataContentRouteModel} */
  lastContentModel = undefined;

  /**
   * Timestamp in ms which is updated everytime, when the recently used resources
   * data is updated - for observing purposes.
   * @type {number}
   */
  @tracked
  recentlyUsedWriteTimestamp = 0;

  constructor() {
    super(...arguments);
    // When leaving the app, but staying in the same web browser tab, remember which
    // resource was used to restore it when openinig sidebar route next time in the same
    // web browser tab. This is needed beside storing the last resource in the
    // LocalStorage to support remembering space when using multiple web browser tabs at
    // once. For example, user has two web browser windows opened: in 1st window they open
    // Space1, and in second window open Space2 (in this order in time). When user changes
    // the URL to the Onezone domain in the first web browser tab, they should see Space1.
    // Without the following code, the user would see Space2, because the default resource
    // is read from LocalStorage, which is set by second web browser tab.
    globals.window.addEventListener('beforeunload', () => {
      if (this.lastSidebarModel && this.lastContentModel) {
        this.setSessionLastUsedResource(this.lastSidebarModel, this.lastContentModel);
      }
    });
  }

  /**
   * ID of current user.
   * @virtual
   * @type {string}
   */
  get userId() {
    return undefined;
  }

  /**
   * @virtual
   * @returns {Array<OnedataTabModel>}
   */
  @computed
  get tabModels() {
    const defaultResourceIdResolver = this.defaultResourceId.bind(this);
    return [
      { id: 'spaces', icon: 'browser-directory' },
      { id: 'shares', icon: 'browser-share' },
      { id: 'providers', icon: 'provider', allowIndex: true },
      { id: 'groups', icon: 'groups', defaultAspect: 'members' },
      { id: 'tokens', icon: 'tokens' },
      { id: 'harvesters', icon: 'light-bulb', defaultAspect: 'plugin' },
      { id: 'atmInventories', icon: 'atm-inventory', defaultAspect: 'workflows' },
      {
        id: 'clusters',
        icon: 'cluster',
        isDefault: true,
        defaultAspect: 'overview',
      },
    ].map(tabModel => {
      tabModel.defaultResourceId = defaultResourceIdResolver;
      return tabModel;
    });
  }

  findOutResourceId(resourceId /* , resourceType */ ) {
    return resourceId;
  }

  /**
   * Default implementation for `defaultResourceId` callback in `OnedataTabModel`.
   * @param {OnedataSidebarRouteModel} sidebarModel
   * @returns {object}
   */
  async defaultResourceId(sidebarModel) {
    return this.getLastUsedResourceId(sidebarModel);
  }

  /**
   * @param {OnedataSidebarRouteModel} sidebarRouteModel
   * @param {OnedataContentRouteModel} contentRouteModel
   * @returns {Promise<string>}
   */
  async getDefaultAspect(sidebarRouteModel, contentRouteModel) {
    const tabId = camelize(sidebarRouteModel.resourceType);
    const tabModel = this.tabModels.find(tab => tab.id === tabId);
    if (!tabModel?.defaultAspect) {
      return this.defaultAspect;
    }
    if (typeof tabModel.defaultAspect === 'string') {
      return tabModel.defaultAspect;
    }
    if (typeof tabModel.defaultAspect === 'function') {
      return await tabModel.defaultAspect(sidebarRouteModel, contentRouteModel);
    }
  }

  /**
   * @param {OnedataSidebarRouteModel} sidebarRouteModel
   * @returns {Promise<string>}
   */
  async getDefaultResourceId(sidebarRouteModel) {
    const { resourceType } = sidebarRouteModel;
    let resourceId;
    resourceId = await this.getTabModelDefaultResourceId(sidebarRouteModel);
    const isValid = await this.validateResourceId(resourceType, resourceId);
    if (!isValid) {
      resourceId = await this.getFirstResourceId(sidebarRouteModel);
    }
    return resourceId;
  }

  /**
   * Check if the resource can be loaded as content. Sometimes the resolved default
   * resource ID could be deleted or non available for the current user, so we need to
   * check if the resource ID is valid.
   * @private
   * @param {string} resourceType
   * @param {string} resourceId
   * @returns {boolean} If true, the resource ID can be loaded.
   */
  async validateResourceId(resourceType, resourceId) {
    if (!resourceId) {
      return false;
    }
    try {
      const resourceGri = this.findOutResourceId(resourceId, resourceType);
      await this.contentResources.getModelFor(resourceType, resourceGri);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * @private
   * @param {OnedataSidebarRouteModel} sidebarRouteModel
   * @returns {Promise<string>}
   */
  async getTabModelDefaultResourceId(sidebarRouteModel) {
    const { resourceType } = sidebarRouteModel;
    const tabId = camelize(resourceType);
    const tabModel = this.tabModels.find(tab => tab.id === tabId);
    let defaultResourceId;
    if (tabModel) {
      if (typeof tabModel.defaultResourceId === 'string') {
        defaultResourceId = tabModel.defaultResourceId;
      }
      if (typeof tabModel.defaultResourceId === 'function') {
        defaultResourceId = await tabModel?.defaultResourceId?.(sidebarRouteModel);
      }
    }
    return defaultResourceId;
  }

  /**
   * @private
   * @param {OnedataSidebarRouteModel} sidebarRouteModel
   * @returns {Promise<string>}
   */
  async getFirstResourceId(sidebarRouteModel) {
    const { resourceType, collection } = sidebarRouteModel;
    // TODO: VFS-12643 If collection is ChunksArray, then it will get the first item from
    // visible slice of collection. Maybe implement fetching first item (in collection).
    const array = collection.fullArray || collection.array;
    const firstRecord = sortByProperties(
      array,
      this.sidebarResources.getItemsSortingFor(resourceType)
    )[0];
    if (firstRecord) {
      return firstRecord.entityId ?? firstRecord.id;
    } else {
      return undefined;
    }
  }

  /**
   * @param {OnedataSidebarRouteModel} sidebarModel
   * @returns {string}
   */
  getLastUsedResourceId(sidebarModel) {
    const { resourceType } = sidebarModel;
    let lastUsedId;
    lastUsedId = this.sessionStorage.getItem(
      this.lastUsedIdStorageKey(resourceType)
    );
    if (!lastUsedId) {
      lastUsedId = this.localStorage.getItem(
        this.lastUsedIdStorageKey(resourceType)
      );
    }
    // Earlier versions of NavigationTabsConfiguration might write "null" string into
    // storage.
    if (lastUsedId === 'null') {
      lastUsedId = null;
    }
    return lastUsedId;
  }

  setSessionLastUsedResource(sidebarModel, contentModel) {
    if (!sidebarModel || !contentModel) {
      console.error(
        'NavigationTabsConfiguration.setPersistentLastUsedResource: sidebar and content models are mandatory'
      );
      return;
    }
    const { resourceType } = sidebarModel;
    const { resource } = contentModel;
    const resourceId = this.getResourceId(resource);
    if (!resourceId || resourceId === 'null') {
      console.warn(
        'NavigationTabsConfiguration.setPersistentLastUsedResource: tried to set nullish last used resource - skipping'
      );
      return;
    }
    this.sessionStorage.setItem(
      this.lastUsedIdStorageKey(resourceType),
      resourceId
    );
  }

  /**
   * @param {OnedataSidebarRouteModel} sidebarModel
   * @param {OnedataContentRouteModel} contentModel
   */
  setPersistentLastUsedResource(sidebarModel, contentModel) {
    if (!sidebarModel || !contentModel) {
      console.error(
        'NavigationTabsConfiguration.setPersistentLastUsedResource: sidebar and content models are mandatory'
      );
      return;
    }
    const { resourceType } = sidebarModel;
    const { resource } = contentModel;
    this.lastSidebarModel = sidebarModel;
    this.lastContentModel = contentModel;
    const resourceId = this.getResourceId(resource);
    if (!resourceId || resourceId === 'null') {
      console.warn(
        'NavigationTabsConfiguration.setPersistentLastUsedResource: tried to set nullish last used resource - skipping'
      );
      return;
    }
    this.localStorage.setItem(
      this.lastUsedIdStorageKey(resourceType),
      resourceId
    );
    // MRU support is currently enabled only for spaces (experimental UX)
    if (resourceType === 'spaces') {
      this.registerResourceUsage(resourceType, resourceId);
    }
  }

  registerResourceUsage(resourceType, resourceId) {
    /** @type {RecentlyUsedMap} */
    const recentlyUsedMap = this.readRecentlyUsed(resourceType);
    recentlyUsedMap[resourceId] = new Date().getTime();
    this.writeRecentlyUsed(resourceType, recentlyUsedMap);
  }

  /**
   * @param {string} resourceType
   * @param {number} count
   * @returns {Array<string>}
   */
  getRecentlyUsedResourceIds(resourceType, count) {
    const recentlyUsed = this.readRecentlyUsed(resourceType);
    return this.filterMaxValues(recentlyUsed, count);
  }

  /**
   * @private
   * @param {RecentlyUsedMap} recentlyUsed
   * @param {number} count
   * @returns {Array<string>}
   */
  filterMaxValues(recentlyUsed, count) {
    const maxEntries = [];
    const entries = [...Object.entries(recentlyUsed)];
    for (let i = 0; i < count && entries.length; ++i) {
      const maxEntry = _.maxBy(entries, ([, timestamp]) => timestamp);
      maxEntries.push(maxEntry);
      _.pull(entries, maxEntry);
    }
    return maxEntries.map(([resourceId]) => resourceId);
  }

  /**
   * @private
   * @param {string} resourceType
   * @returns {RecentlyUsedMap}
   */
  readRecentlyUsed(resourceType) {
    const storageKey = this.recentlyUsedIdStorageKey(resourceType);
    /** @type {RecentlyUsedMap} */
    let recentlyUsedMap;
    try {
      const rawData = this.localStorage.getItem(storageKey);
      if (rawData) {
        recentlyUsedMap = JSON.parse(rawData);
      } else {
        recentlyUsedMap = {};
      }
    } catch (error) {
      console.error(
        'NavigationTabsConfiguration: could not read resource recently used data',
        error
      );
      recentlyUsedMap = {};
    }
    return recentlyUsedMap;
  }

  /**
   * @private
   * @param {string} resourceType
   * @param {RecentlyUsedMap} recentlyUsedMap
   */
  writeRecentlyUsed(resourceType, recentlyUsedMap) {
    const storageKey = this.recentlyUsedIdStorageKey(resourceType);
    this.localStorage.setItem(storageKey, JSON.stringify(recentlyUsedMap));
    this.set('recentlyUsedWriteTimestamp', new Date().getTime());
  }

  /**
   * @param {object} resource
   * @returns {string}
   */
  getResourceId(resource) {
    return resource && get(resource, 'entityId');
  }

  /**
   * @param {string} resourceType
   * @returns {string}
   */
  lastUsedIdStorageKey(resourceType) {
    return `${this.commonStorageIdPrefix(resourceType)}.lastUsedId`;
  }

  recentlyUsedIdStorageKey(resourceType) {
    return `${this.commonStorageIdPrefix(resourceType)}.recentlyUsedIds`;
  }

  /**
   * @private
   * @param {string} resourceType Eg. 'spaces', 'groups' - as in OnedataSidebarRouteModel.
   * @returns {string}
   */
  commonStorageIdPrefix(resourceType) {
    return `navigationTabsConfiguration.user:${this.userId}.sidebar.${resourceType}`;
  }
}

export default CommonNavigationTabsConfiguration;
