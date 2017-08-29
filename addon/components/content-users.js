/**
 * Main view for single user account
 *
 * @module components/content-users
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import Onepanel from 'npm:onepanel';

import layout from 'onedata-gui-common/templates/components/content-users';

const {
  Component,
  inject: { service },
  computed,
  get,
} = Ember;

const {
  UserModifyRequest,
} = Onepanel;

export default Component.extend({
  layout,

  i18n: service(),
  onepanelServer: service(),
  globalNotify: service(),

  /**
   * To inject.
   * @type {OnepanelGui.UserDetails}
   */
  user: null,

  /**
   * If true, set credentials form to changingPassword mode
   * @type {boolean}
   */
  _changingPassword: false,

  _changePasswordButtonLabel: computed('_changingPassword', function () {
    let i18n = this.get('i18n');
    return this.get('_changingPassword') ?
      i18n.t('components.contentUsers.cancelChangePassword') :
      i18n.t('components.contentUsers.changePassword');
  }),

  _changePasswordButtonType: computed('_changingPassword', function () {
    return this.get('_changingPassword') ? 'default' : 'primary';
  }),

  _changePasswordButtonClass: computed('_changingPassword', function () {
    return this.get('_changingPassword') ?
      'btn-change-password-cancel' : 'btn-change-password-start';
  }),

  actions: {
    toggleChangePassword() {
      this.toggleProperty('_changingPassword');
    },

    /**
     * Make an API call to change password of current user
     * 
     * @param {object} { oldPassword: string, newPassword: string }
     * @returns {Promise} an API call promise
     */
    submitChangePassword({ currentPassword, newPassword }) {
      let {
        user,
        i18n,
        onepanelServer,
        globalNotify,
      } = this.getProperties(
        'user',
        'i18n',
        'onepanelServer',
        'globalNotify'
      );
      let changingPassword = onepanelServer.request(
        'onepanel',
        'modifyUser',
        get(user, 'id'),
        UserModifyRequest.constructFromObject({
          currentPassword,
          newPassword,
        })
      );

      // TODO i18n
      changingPassword.catch(error => {
        globalNotify.backendError(
          i18n.t('components.contentUsers.passwordChangedSuccess'),
          error
        );
      });

      changingPassword.then(() => {
        globalNotify.info(
          i18n.t('components.contentUsers.passwordChangedSuccess')
        );
        this.set('_changingPassword', false);
      });

      return changingPassword;
    },
  },
});
