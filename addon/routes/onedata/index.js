/**
 * Authenticated main view index (without any specific route)
 *
 * @module routes/onedata/index
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

import { get } from '@ember/object';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.modelFor('onedata');
  },

  afterModel(model) {
    let mainMenuItems = get(model, 'mainMenuItems');
    let firstItem = mainMenuItems[0];
    if (mainMenuItems) {
      let firstItemId = get(firstItem, 'id');
      this.transitionTo('onedata.sidebar', firstItemId)
    } else {
      console.error('routes:index: empty collection of main menu items');
    }
  },
});
