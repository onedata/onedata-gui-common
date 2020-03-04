/**
 * A component when available login options should be presented
 *
 * @module components/login-box
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { alias } from '@ember/object/computed';

import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-box';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';

export const sessionExpiredKey = 'sessionExpired';

export default Component.extend({
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

  isBusy: false,

  _sessionStorage: sessionStorage,

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
    const _sessionStorage = this.get('_sessionStorage');
    if (_sessionStorage.getItem(sessionExpiredKey)) {
      this.set('sessionHasExpired', true);
      _sessionStorage.removeItem(sessionExpiredKey);
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

    authenticationFailure() {
      safeMethodExecution(this, 'set', 'isBusy', false);
    },

    backFromError() {
      this.set('showAuthenticationError', false);
    },
  },
});
