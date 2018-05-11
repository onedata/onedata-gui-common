/**
 * Authenticated main view index (without any specific route)
 *
 * @module routes/onedata/index
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { get } from '@ember/object';
import _ from 'lodash';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.modelFor('onedata');
  },

  afterModel(model) {
    let mainMenuItems = get(model, 'mainMenuItems');
    if (mainMenuItems) {
      let defaultItem = _.find(mainMenuItems, i => get(i, 'isDefault')) ||
        mainMenuItems[0];
      let defaultItemId = get(defaultItem, 'id');
      this.transitionTo('onedata.sidebar', defaultItemId);
    } else {
      console.error('routes:index: empty collection of main menu items');
    }
  },
});
