/**
 * Defines actions that use routes for closure actions in route templates
 *
 * @module controllers/onedata/sidebar/content/aspect
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Controller,
} = Ember;

export default Controller.extend({
  actions: {
    changeAspect(aspectId) {
      // TODO: a loader for clicked sidebar item can be done here by usin transition as a promise
      return this.transitionToRoute(
        'onedata.sidebar.content.aspect',
        aspectId
      );
    }
  }
});
