/**
 * Defines actions that use routes for closure actions in route templates
 *
 * @module controllers/onedata
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    mainMenuItemChanged(itemId) {
      return this.transitionToRoute('onedata.sidebar', itemId);
    },
    manageAccount() {
      return this.transitionToRoute('onedata.sidebar', 'users');
    },
    changeResourceId(resourceType, itemId) {
      // TODO: a loader for clicked sidebar item can be done here by usin transition as a promise
      return this.transitionToRoute(
        'onedata.sidebar.content',
        resourceType,
        itemId
      );
    }
  }
});
