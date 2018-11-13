/**
 * A component when available login options should be presented
 *
 * @module components/login-box
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { alias } from '@ember/object/computed';

import EmberObject, { computed } from '@ember/object';
import { inject } from '@ember/service';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-box';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  layout,
  classNames: ['login-box'],

  globalNotify: inject(),
  session: inject(),
  navigationState: inject(),

  /**
   * Current status of showing authentication error message, as the message
   * can be discarded by clicking on back button.
   * @type {boolean}
   */
  showAuthenticationError: false,

  /**
   * @virtual
   * See: `mixin:authentication-error-hander#authenticationErrorReason`
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

  /**
   * True, if previous session has expired
   */
  sessionHasExpired: alias('session.data.hasExpired'),

  // FIXME: use of this flag is temporary, cookie maybe?
  authFor: computed('navigationState.queryParams.auth_for', function authFor() {
    return this.get('navigationState.queryParams.auth_for');
  }),

  init() {
    this._super(...arguments);
    this.set('headerModel', EmberObject.create({}));
    if (this.get('authenticationErrorReason')) {
      this.set('showAuthenticationError', true);
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
  }
});
