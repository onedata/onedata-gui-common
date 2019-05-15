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
import { not, or } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  classNames: ['basicauth-login-form'],

  session: service(),
  globalNotify: service(),

  username: '',
  password: '',

  isDisabled: false,
  areCredentialsInvalid: false,

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

  submitIsDisabled: or('isDisabled', not('username'), not('password')),

  didInsertElement() {
    this._super(...arguments);
    this.$('.login-username').focus();
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
      // TODO: in root password branch, remember to allow only password!
      if (!this.get('submitIsDisabled')) {
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
      }
    },
    backAction() {
      const backButtonAction = this.get('backButtonAction');
      if (backButtonAction) {
        backButtonAction();
      }
    }
  }
});
