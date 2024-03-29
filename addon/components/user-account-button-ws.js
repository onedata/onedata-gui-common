/**
 * Implements `user-account-button` for Onedata Websocket backend based GUIs
 * - sets `username` from User record from Onedata Websocket
 *
 * NOTE: requires onedata websocket managed session
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';

import { inject as service } from '@ember/service';

import UserAccountButton from 'onedata-gui-common/components/user-account-button';
import layout from 'onedata-gui-common/templates/components/user-account-button';

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
  username: reads('user.name'),

  init() {
    this._super(...arguments);
    this.get('currentUser').getCurrentUserRecord().then(user =>
      this.set('user', user)
    );
  },
});
