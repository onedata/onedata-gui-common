/**
 * A form that is used to login with username and password 
 *
 * @module components/basicauth-login-form
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/basicauth-login-form';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['basicauth-login-form'],

  session: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.basicauthLoginForm',

  username: '',
  password: '',

  isDisabled: false,
  areCredentialsInvalid: false,

  /**
   * If true, do not render, validate and use username field.
   * @virtual optional
   * @type {boolean}
   */
  passphraseMode: false,

  /**
   * Action called on 'back' button click. If not defined, back button will
   * not be visible.
   * @virtual optional
   * @type {function}
   */
  backButtonAction: undefined,

  /**
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  authenticationStarted: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  authenticationSuccess: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  authenticationFailure: notImplementedIgnore,

  didInsertElement() {
    this._super(...arguments);

    const passphraseMode = this.get('passphraseMode');

    if (passphraseMode) {
      this.$('.login-lock').focus();
    } else {
      this.$('.login-username').focus();
    }
  },

  onLoginStarted() {
    this.set('isDisabled', true);
  },

  onLoginSuccess(username, password) {
    console.debug(
      `component:basicauth-login-form: Credentials provided for ${username} are valid`
    );
    this.get('authenticationSuccess')({
      username,
      password
    });
    safeMethodExecution(this, 'set', 'isDisabled', false);
  },

  onLoginFailure(username, password) {
    console.debug(
      `component:basicauth-login-form: Credentials provided for ${username} are invalid`
    );
    this.get('authenticationFailure')({
      username,
      password
    });
    safeMethodExecution(this, 'setProperties', {
      isDisabled: false,
      areCredentialsInvalid: true,
    });
  },

  onInitClientError(error) {
    // TODO better message, i18n
    this.get('globalNotify')
      .error('Failed to initialize HTTP client: ' + error || 'unknown error');
  },

  actions: {
    submitLogin(username, password) {
      const {
        session,
        authenticationStarted,
      } = this.getProperties('session', 'authenticationStarted');

      this.onLoginStarted();
      authenticationStarted();

      const loginCalling = session.authenticate('authenticator:application',
        username,
        password
      );

      loginCalling.then(() => this.onLoginSuccess(username, password));
      loginCalling.catch(() => this.onLoginFailure(username, password));

      return loginCalling;
    },
    backAction() {
      const backButtonAction = this.get('backButtonAction');
      if (backButtonAction) {
        backButtonAction();
      }
    }
  }
});
