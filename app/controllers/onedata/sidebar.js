/**
 * Defines actions that use routes for closure actions in route templates
 *
 * @module controllers/onedata/sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
  contentResources: inject(),

  actions: {
    changeResourceId(resourceType, itemId) {
      const contentResources = this.get('contentResources');
      // TODO: a loader for clicked sidebar item can be done here by usin transition as a promise
      return this.transitionToRoute(
        'onedata.sidebar.content',
        resourceType,
        contentResources.getRoutableIdFor(itemId)
      );
    }
  }
});
