/**
 * A form that is used to login with username and password
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/basicauth-login-form';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['basicauth-login-form'],

  session: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.basicauthLoginForm',

  /**
   * @virtual
   * @type {Utils.LoginViewModel}
   */
  loginViewModel: undefined,

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

  //#region state

  /**
   * Value of username input.
   * @type {string}
   */
  username: '',

  /**
   * Value of password input.
   * @type {string}
   */
  password: '',

  /**
   * Disabled state of inputs.
   * @type {boolean}
   */
  isDisabled: false,

  /**
   * True if last submit attempt failed because of invalid credentials.
   * @type {boolean}
   */
  areCredentialsInvalid: false,

  //#endregion

  didInsertElement() {
    this._super(...arguments);

    const {
      passphraseMode,
      element,
    } = this.getProperties('passphraseMode', 'element');

    if (passphraseMode) {
      element.querySelector('.login-lock').focus();
    } else {
      element.querySelector('.login-username').focus();
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
      password,
    });
    safeMethodExecution(this, 'set', 'isDisabled', false);
  },

  onLoginFailure(username, password, error) {
    console.debug(
      `component:basicauth-login-form: Basicauth for "${username}" failed`
    );
    this.get('authenticationFailure')({
      username,
      password,
      error,
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
    async submitLogin(username, password) {
      this.onLoginStarted();
      this.authenticationStarted();

      try {
        await this.loginViewModel.usernameAuthenticate(username, password);
        this.onLoginSuccess(username, password);
      } catch (error) {
        this.onLoginFailure(username, password, error);
        throw error;
      }
    },
    backAction() {
      const backButtonAction = this.get('backButtonAction');
      if (backButtonAction) {
        backButtonAction();
      }
    },
  },
});
