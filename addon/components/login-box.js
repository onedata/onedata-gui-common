/**
 * A component when available login options should be presented
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { alias } from '@ember/object/computed';

import EmberObject, { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-box';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import AuthenticationErrorMessage from 'onedata-gui-common/mixins/authentication-error-message';
import { underscore } from '@ember/string';
import globals from 'onedata-gui-common/utils/globals';

export const sessionExpiredKey = 'sessionExpired';

export default Component.extend(AuthenticationErrorMessage, {
  layout,
  classNames: ['login-box'],

  globalNotify: service(),
  session: service(),

  /**
   * Current status of showing authentication error message, as the message
   * can be discarded by clicking on back button.
   * @type {boolean}
   */
  showAuthenticationError: false,

  /**
   * @virtual
   * See: `mixin:authentication-error-handler#authenticationErrorReason`
   * @type {string}
   */
  authenticationErrorReason: undefined,

  /**
   * @virtual
   * See: `mixin:authentication-error-hander#authenticationErrorState`
   * @type {string}
   */
  authenticationErrorState: undefined,

  /**
   * If true, data necessary to render login-box is still loading
   * @type {boolean}
   */
  isLoading: false,

  /**
   * Data object passed to the login-box header component
   * @type {EmberObject}
   */
  headerModel: undefined,

  /**
   * When one of these error occurs after username and password sign-in, that means
   * user should not try other password, because invalid form data is not the problem.
   */
  fatalBasicAuthErrors: Object.freeze([
    'basicAuthNotSupported',
    'basicAuthDisabled',
    'userBlocked',
  ]),

  isBusy: false,

  /**
   * True, if previous session has expired
   */
  sessionHasExpired: alias('session.data.hasExpired'),

  init() {
    this._super(...arguments);
    this.set('headerModel', EmberObject.create({}));
    if (this.get('authenticationErrorReason')) {
      this.set('showAuthenticationError', true);
    }
    this.consumeSessionExpiredFlag();
  },

  consumeSessionExpiredFlag() {
    if (globals.sessionStorage.getItem(sessionExpiredKey)) {
      this.set('sessionHasExpired', true);
      globals.sessionStorage.removeItem(sessionExpiredKey);
    }
  },

  actions: {
    authenticationStarted() {
      this.set('isBusy', true);
    },

    authenticationSuccess() {
      this.get('globalNotify').info('Authentication succeeded!');
      safeMethodExecution(this, 'set', 'isBusy', false);
    },

    authenticationFailure({ error }) {
      const fatalBasicAuthErrors = this.get('fatalBasicAuthErrors');
      safeMethodExecution(this, 'set', 'isBusy', false);
      let reason;
      const errorId = error && get(error, 'details.authError.id');
      if (fatalBasicAuthErrors.includes(errorId)) {
        reason = underscore(errorId);
      } else if (errorId !== 'badBasicCredentials') {
        reason = 'unknown';
      }
      if (reason) {
        this.setProperties({
          authenticationErrorReason: reason,
          showAuthenticationError: true,
        });
      }
    },

    backFromError() {
      this.set('showAuthenticationError', false);
    },
  },
});
