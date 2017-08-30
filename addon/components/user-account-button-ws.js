/**
 * Implements `user-account-button` for Onedata Websocket backend based GUIs
 * - sets `username` from User record from Onedata Websocket
 *
 * NOTE: requires onedata websocket managed session
 *
 * @module components/user-account-button-ws
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';
import layout from 'onedata-gui-common/templates/components/user-account-button';

const {
  inject: { service },
} = Ember;

export default UserAccountButton.extend({
  layout,

  currentUser: service(),
  globalNotify: service(),

  /**
   * @override
   */
  username: null,

  init() {
    this._super(...arguments);
    this.get('currentUser').getCurrentUserRecord().then(user => {
      this.set('username', user.get('name'));
    })
  },

  actions: {
    /**
     * @override
     */
    manageAccount() {
      // TODO implement
      this.get('globalNotify').error('Account settings not implemented yet');
    },
  },
});
