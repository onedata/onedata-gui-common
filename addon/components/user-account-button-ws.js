/**
 * Implements `user-account-button` for Onedata Websocket backend based GUIs
 * - sets `username` from session data retrieved from Onedata Websocket session
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
  computed: { readOnly },
} = Ember;

export default UserAccountButton.extend({
  layout,

  session: service(),
  globalNotify: service(),

  /**
   * @override
   */
  username: readOnly('session.data.authenticated.identity.user'),

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
