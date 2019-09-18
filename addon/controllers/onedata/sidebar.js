/**
 * Defines actions that use routes for closure actions in route templates
 *
 * @module controllers/onedata/sidebar
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Controller.extend({
  guiUtils: service(),
  navigationState: service(),

  // actions: {
  //   changeResourceId(resourceType, itemId) {
  //     const {
  //       guiUtils,
  //       navigationState,
  //     } = this.getProperties('guiUtils', 'navigationState');
  //     // TODO: a loader for clicked sidebar item can be done here by using transition as a promise
  //     return this.transitionToRoute(
  //       'onedata.sidebar.content.aspect',
  //       resourceType,
  //       guiUtils.getRoutableIdFor(itemId),
  //       get(navigationState, 'activeAspect') || 'index',
  //     );
  //   }
  // }
});
