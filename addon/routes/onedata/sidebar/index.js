/**
 * Redirects to a default resource content view in collection or empty information
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import _ from 'lodash';
import { camelize } from '@ember/string';
import findRouteInfo from 'onedata-gui-common/utils/find-route-info';

export default Route.extend({
  router: service(),
  globalNotify: service(),
  media: service(),
  guiUtils: service(),
  sidebarResources: service(),
  navigationTabsConfiguration: service(),

  model() {
    return this.modelFor('onedata.sidebar');
  },

  async afterModel(model, transition) {
    const tabId = camelize(findRouteInfo(transition, 'onedata.sidebar').params['type']);
    const onedataTabs = this.navigationTabsConfiguration.tabModels;
    const tab = _.find(onedataTabs, t => t.id === tabId);
    if (!this.get('media.isMobile')) {
      if (tab && tab.allowIndex) {
        this.transitionTo('onedata.sidebar.content', 'not-selected');
      } else {
        await this.redirectToDefaultResource(model);
      }
    }
  },

  refreshOnLeavingMobile: observer(
    'media.isMobile',
    function refreshOnLeavingMobile() {
      if (
        this.get('router.currentRouteName') === 'onedata.sidebar.index' &&
        !this.get('media.isMobile')
      ) {
        this.refresh();
      }
    }
  ),

  async redirectToDefaultResource(model) {
    const { resourceType, collection } = model;
    const guiUtils = this.get('guiUtils');
    let resourceIdToRedirect;
    if (!collection.array.length) {
      resourceIdToRedirect = 'empty';
    } else {
      const defaultResource =
        await this.navigationTabsConfiguration.getDefaultResource(model);
      resourceIdToRedirect = guiUtils.getRoutableIdFor(defaultResource);
    }
    if (resourceIdToRedirect != null) {
      this.transitionTo('onedata.sidebar.content', resourceType, resourceIdToRedirect);
    } else {
      throw new Error(
        'route:onedata/sidebar/index: the collection is not empty, but cannot find default resource'
      );
    }
  },
});
