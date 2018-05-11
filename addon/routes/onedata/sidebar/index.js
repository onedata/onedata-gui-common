/**
 * Redirects to a default resource content view in collection or empty information
 *
 * @module routes/onedata/sidebar/index
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { observer } from '@ember/object';
import _ from 'lodash';
import config from 'ember-get-config';

const {
  onedataTabs
} = config;

function getDefaultResource(list) {
  return list.objectAt(0);
}

export default Route.extend({
  globalNotify: service(),
  media: service(),
  guiUtils: service(),

  model() {
    return this.modelFor('onedata.sidebar');
  },

  afterModel(model, transition) {
    const sidebarType = transition.params['onedata.sidebar'].type;
    const tab = _.find(onedataTabs, t => t.id === sidebarType);
    if (!this.get('media.isMobile')) {
      if (tab.allowIndex) {
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

  redirectToDefault({ resourceType, collection }) {
    const guiUtils = this.get('guiUtils');
    const list = get(collection, 'list');
    let resourceIdToRedirect = get(list, 'length') > 0 ?
      guiUtils.getRoutableIdFor(getDefaultResource(list)) : 'empty';
    if (resourceIdToRedirect != null) {
      this.transitionTo(`onedata.sidebar.content`, resourceType, resourceIdToRedirect);
    } else {
      throw new Error(
        'route:onedata/sidebar/index: the collection is not empty, but cannot find default resource'
      );
    }
  },
});
