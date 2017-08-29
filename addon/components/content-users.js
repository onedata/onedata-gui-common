/**
 * Main view for single user account
 *
 * @module components/content-users
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import layout from 'onedata-gui-common/templates/components/content-users';

const {
  Component,
  inject: { service },
  computed,
} = Ember;

export default Component.extend({
  layout,

  i18n: service(),
  globalNotify: service(),

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

  /**
   * @abstract
   * Make an API call to change password of current user
   *
   * @param {object} { oldPassword: string, newPassword: string }
   * @returns {Promise} an API call promise, resolve on success
   */
  _changePassword() {
    throw new Error('not implemented');
  },

  actions: {
    toggleChangePassword() {
      this.toggleProperty('_changingPassword');
    },

    /**
     * Make an API call to change password of current user
     * and handles promise resolve, reject
     * 
     * @param {object} { oldPassword: string, newPassword: string }
     * @returns {Promise} an API call promise, resolves on change password success
     */
    submitChangePassword({ currentPassword, newPassword }) {
      let {
        i18n,
        globalNotify,
      } = this.getProperties(
        'i18n',
        'globalNotify'
      );

      let changingPassword = this._changePassword({ currentPassword, newPassword });

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
