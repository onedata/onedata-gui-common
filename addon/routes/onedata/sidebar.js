/**
 * TODO: documentation
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, action } from '@ember/object';
import Route from '@ember/routing/route';
import { scheduleOnce } from '@ember/runloop';
import { camelize } from '@ember/string';
import findRouteInfo from 'onedata-gui-common/utils/find-route-info';
import globals from 'onedata-gui-common/utils/globals';
import { inject as service } from '@ember/service';

export default class SidebarRoute extends Route {
  @service sidebarResources;
  @service navigationState;
  @service navigationTabsConfiguration;

  isValidTab(tabName) {
    const onedataTabs = this.navigationTabsConfiguration.tabModels;
    return Boolean(onedataTabs.findBy('id', camelize(tabName))) ||
      tabName === 'users';
  }

  /**
   * @override
   */
  beforeModel(transition) {
    const resourceType = findRouteInfo(transition, 'onedata.sidebar').params['type'];
    if (!this.isValidTab(resourceType)) {
      console.warn(
        `Failed to render ${resourceType} resource type. ` +
        'Redirecting to default resource type...'
      );
      this.transitionTo('onedata.sidebar', this.getDefaultTab());
      return;
    } else {
      this.navigationState.setProperties({
        isActiveResourceCollectionLoading: true,
        hasActiveResourceCollectionLoadingFailed: false,
        activeResourceCollection: undefined,
        activeResourceId: undefined,
      });
    }
  }

  /**
   * @override
   */
  async model({ type }) {
    /** @type {SidebarModelLoader} */
    const sidebarModelLoader = this.sidebarResources.createSidebarModelLoader(type);
    /** @type {SidebarLoadingController} */
    const loadingController = this.controllerFor('onedata.sidebar-loading');
    loadingController.set('sidebarModelLoader', sidebarModelLoader);
    const sidebarCollection = await sidebarModelLoader.sidebarCollectionPromise;
    return { collection: sidebarCollection, resourceType: type };
  }

  /**
   * @override
   */
  afterModel(model) {
    this.navigationState.setProperties({
      activeResourceType: model.resourceType,
      activeResourceCollection: model.collection,
      isActiveResourceCollectionLoading: false,
    });
  }

  /**
   * @override
   */
  renderTemplate(controller, model) {
    const sidebarComponentName = this.sidebarResources
      .getSidebarComponentNameFor(get(model, 'resourceType'));

    this.render('onedata.sidebar', {
      into: 'onedata',
      outlet: 'sidebar',
      model: Object.assign({}, model, { sidebarComponentName }),
    });
    scheduleOnce('afterRender', this, 'scrollSidebarToTop');
  }

  scrollSidebarToTop() {
    const sidebar = globals.document.querySelector('.col-sidebar');
    if (sidebar) {
      sidebar.scrollTop = 0;
    }
  }

  /**
   * Returns default application tab, that can be used as a fallback when
   * user does not provide any
   * @returns {string}
   */
  getDefaultTab() {
    const onedataTabs = this.navigationTabsConfiguration.tabModels;
    return onedataTabs[0]?.id;
  }

  @action
  error() {
    this.navigationState.setProperties({
      hasActiveResourceCollectionLoadingFailed: true,
      isActiveResourceCollectionLoading: false,
    });
    return true;
  }
}
