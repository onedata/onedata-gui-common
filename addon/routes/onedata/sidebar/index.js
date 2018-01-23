/**
 * Redirects to a default resource content view in collection or empty information
 *
 * @module routes/onedata/sidebar/index
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { inject as service } from '@ember/service';
import { get } from '@ember/object';

function getDefaultResourceId(collection) {
  let defaultResource = collection.objectAt(0);
  return get(defaultResource, 'id');
}

export default Route.extend({
  globalNotify: service(),

  model() {
    return this.modelFor('onedata.sidebar');
  },

  redirect({ resourceType, collection }, transition) {
    let resourceIdToRedirect =
      collection.length > 0 ? getDefaultResourceId(collection) : 'empty';
    if (resourceIdToRedirect != null) {
      this.transitionTo(`onedata.sidebar.content`, resourceType, resourceIdToRedirect);
    } else {
      // TODO i18n
      this.get('globalNotify').error(
        'Collection is not empty, but cannot get default resource ID - this is a fatal routing error'
      );
      transition.abort();
    }
  }
});
