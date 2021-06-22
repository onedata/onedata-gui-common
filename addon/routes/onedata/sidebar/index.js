/**
 * Redirects to a default resource content view in collection or empty information
 *
 * @module routes/onedata/sidebar/index
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { observer } from '@ember/object';
import _ from 'lodash';
import config from 'ember-get-config';
import sortByProperties from 'onedata-gui-common/utils/ember/sort-by-properties';
import { camelize } from '@ember/string';

const {
  onedataTabs,
} = config;

export default Route.extend({
  globalNotify: service(),
  media: service(),
  guiUtils: service(),
  sidebarResources: service(),

  model() {
    return this.modelFor('onedata.sidebar');
  },

  afterModel(model, transition) {
    const tabId = camelize(transition.params['onedata.sidebar'].type);
    const tab = _.find(onedataTabs, t => t.id === tabId);
    if (!this.get('media.isMobile')) {
      if (tab && tab.allowIndex) {
        this.transitionTo('onedata.sidebar.content', 'not-selected');
      } else {
        this.redirectToDefault(model);
      }
    }
  },

  refreshOnLeavingMobile: observer('media.isMobile', function () {
    if (
      this.get('router.currentRouteName') === 'onedata.sidebar.index' &&
      !this.get('media.isMobile')
    ) {
      this.refresh();
    }
  }),

  getDefaultResource(list, resourceType) {
    return sortByProperties(
      list,
      this.get('sidebarResources').getItemsSortingFor(resourceType)
    )[0];
  },

  redirectToDefault({ resourceType, collection }) {
    const guiUtils = this.get('guiUtils');
    const list = get(collection, 'list');
    let resourceIdToRedirect = get(list, 'length') > 0 ?
      guiUtils.getRoutableIdFor(this.getDefaultResource(list, resourceType)) : 'empty';
    if (resourceIdToRedirect != null) {
      this.transitionTo('onedata.sidebar.content', resourceType, resourceIdToRedirect);
    } else {
      throw new Error(
        'route:onedata/sidebar/index: the collection is not empty, but cannot find default resource'
      );
    }
  },
});
