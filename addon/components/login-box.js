/**
 * A component when available login options should be presented
 *
 * @module components/login-box
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/login-box';

const {
  inject: {
    service
  },
  computed: {
    alias,
  },
} = Ember;

export default Ember.Component.extend({
  layout,
  classNames: ['login-box'],

  globalNotify: service(),
  session: service(),

  isBusy: false,

  /**
   * True, if previous session has expired
   */
  sessionHasExpired: alias('session.data.hasExpired'),

  actions: {
    authenticationStarted() {
      this.set('isBusy', true);
    },

    authenticationSuccess() {
      this.get('globalNotify').info('Authentication succeeded!');
      this.set('isBusy', false);
    },

    authenticationFailure() {
      this.set('isBusy', false);
    }
  }
});
