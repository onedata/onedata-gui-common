/**
 * Authenticated main view index (without any specific route)
 *
 * @module routes/onedata/index
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const {
  Route,
  get,
} = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  model() {
    return this.modelFor('onedata');
  },

  afterModel(model) {
    let firstItemId = get(model, 'mainMenuItems')[0].id;
    this.controllerFor('onedata').send('mainMenuItemChanged', firstItemId);
  },
});
