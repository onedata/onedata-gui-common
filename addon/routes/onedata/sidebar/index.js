/**
 * Redirects to a default resource content view in collection or empty information
 *
 * @module routes/onedata/sidebar/index
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject } from '@ember/service';
import { observer } from '@ember/object';

function getDefaultResourceId(collection) {
  let defaultResource = collection.objectAt(0);
  return get(defaultResource, 'id');
}

export default Route.extend({
  globalNotify: inject(),
  media: inject(),

  model() {
    return this.modelFor('onedata.sidebar');
  },

  afterModel(model /*, transition*/ ) {
    if (!this.get('media.isMobile')) {
      this.redirectToDefault(model);
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
    let resourceIdToRedirect =
      collection.length > 0 ? getDefaultResourceId(collection) : 'empty';
    if (resourceIdToRedirect != null) {
      this.transitionTo(`onedata.sidebar.content`, resourceType, resourceIdToRedirect);
    } else {
      throw new Error(
        'route:onedata/sidebar/index: the collection is not empty, but cannot find default resource'
      );
    }
  },
});
