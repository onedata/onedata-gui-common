/**
 * Configuration and specific logic for rendering and navigating between tabs (main menu
 * and sidebar) in Onedata.
 * This service should be implemented in GUIs that use the Onedata routing and display
 * GUI with tabs.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import sortByProperties from 'onedata-gui-common/utils/ember/sort-by-properties';
import globals from 'onedata-gui-common/utils/globals';
import { get, computed } from '@ember/object';
import { camelize } from '@ember/string';

/**
 * @typedef {OnedataSidebarRouteModel<ResourceT>} Object
 * @property {string} resourceType
 * @property {Array<ResourceT>} collection
 */

/**
 * @typedef {OnedataContentRouteModel<ResourceT>} Object
 * @property {string} resourceId
 * @property {ResourceT} resource
 * @property {Array<ResourceT>} collection
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
 * @property { string | DefaultResourceGetter } [defaultResource] Resource ID (entityId),
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

class CommonNavigationTabsConfiguration extends Service {
  @service sidebarResources;

  defaultAspect = 'index';

  /** @type {Storage} */
  storage = globals.localStorage;

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
    ];
  }

  /**
   * @param {string} tabId
   * @param {OnedataSidebarRouteModel} sidebarRouteModel
   * @param {OnedataContentRouteModel} contentRouteModel
   * @returns {Promise<string>}
   */
  async getDefaultAspect(sidebarRouteModel, contentRouteModel) {
    const tabId = camelize(sidebarRouteModel.resourceType);
    const tabModel = this.tabModels.find(tab => tab.id === tabId);
    if (!tabModel.defaultAspect) {
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
   * @returns {Promise<object>}
   */
  async getDefaultResource(sidebarRouteModel) {
    const { resourceType, collection } = sidebarRouteModel;
    const tabModel = this.tabModels.find(tab => tab.id === resourceType);
    let defaultResource;
    if (typeof tabModel.defaultAspect === 'string') {
      defaultResource = tabModel.defaultResource;
    }
    if (typeof tabModel.defaultAspect === 'function') {
      defaultResource = await tabModel?.defaultResource?.(sidebarRouteModel);
    }
    if (defaultResource) {
      return defaultResource;
    } else {
      return sortByProperties(
        collection.list,
        this.sidebarResources.getItemsSortingFor(resourceType)
      )[0];
    }
  }

  /**
   * @param {OnedataSidebarRouteModel} sidebarModel
   * @returns {object}
   */
  getLastUsedResource(sidebarModel) {
    const { resourceType, collection } = sidebarModel;
    const lastUsedId = this.storage.getItem(
      this.lastUsedIdStorageKey(resourceType)
    );
    if (lastUsedId) {
      const lastUsedResource = get(collection, 'list')
        .find(resource => get(resource, 'entityId') === lastUsedId);
      return lastUsedResource;
    }
  }

  setLastUsedResource(sidebarModel, contentModel) {
    const { resourceType } = sidebarModel;
    const { resource } = contentModel;
    this.storage.setItem(
      this.lastUsedIdStorageKey(resourceType),
      this.getResourceId(resource)
    );
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
    return `navigationTabsConfiguration.user:${this.userId}.sidebar.${resourceType}.lastUsedId`;
  }
}

export default CommonNavigationTabsConfiguration;
