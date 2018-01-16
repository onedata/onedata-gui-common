/**
 * Implements `user-account-button` for Onedata Websocket backend based GUIs
 * - sets `username` from User record from Onedata Websocket
 *
 * NOTE: requires onedata websocket managed session
 *
 * @module components/user-account-button-ws
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';
import layout from 'onedata-gui-common/templates/components/user-account-button';

const {
  inject: { service },
  computed,
} = Ember;

export default UserAccountButton.extend({
  layout,

  currentUser: service(),

  /**
   * @type {models/user}
   */
  user: undefined,

  /**
   * @override
   */
  username: computed.reads('user.name'),

  init() {
    this._super(...arguments);
    this.get('currentUser').getCurrentUserRecord().then(user =>
      this.set('user', user)
    );
  },
});
