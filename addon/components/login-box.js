/**
 * Shows available login options.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-box';
import safeMethodExecution from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/i18n';

export const sessionExpiredKey = 'sessionExpired';

const mixins = [
  I18n,
];

export default Component.extend(...mixins, {
  layout,
  classNames: ['login-box'],

  globalNotify: service(),
  session: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.loginBox',

  /**
   * @virtual
   * @type {Utils.LoginViewModel}
   */
  loginViewModel: undefined,

  //#region state

  /**
   * Current status of showing authentication error message, as the message
   * can be discarded by clicking on back button.
   * @type {boolean}
   */
  showAuthenticationError: false,

  /**
   * If true, data necessary to render login-box is still loading
   * @type {boolean}
   */
  isLoading: false,

  isBusy: false,

  // FIXME: to raczej jest abstract - do zaimplementowania w klasach potomnych
  /**
   * Data object passed to the login-box header component
   * @type {EmberObject}
   */
  headerModel: undefined,

  //#endregion state

  /**
   * @type {ComputedProperty<AuthenticationErrorReason>}
   */
  authenticationErrorReason: reads('loginViewModel.authenticationErrorReason'),

  /**
   * @type {ComputedProperty<AuthenticationErrorState>}
   */
  authenticationErrorState: reads('loginViewModel.authenticationErrorState'),

  authenticationErrorText: reads('loginViewModel.authenticationErrorText'),

  showErrorContactInfo: reads('loginViewModel.showErrorContactInfo'),

  // FIXME: wcześniej był alias na sessions - sprawdzić do czego to służyło, być może tylko onepanel
  sessionHasExpired: reads('loginViewModel.sessionHasExpired'),

  init() {
    this._super(...arguments);
    this.set('headerModel', EmberObject.create({}));
    if (this.authenticationErrorReason) {
      this.set('showAuthenticationError', true);
    }
  },

  actions: {
    // FIXME: być może te 3 akcje należy przenieść do modelu

    authenticationStarted() {
      this.set('isBusy', true);
    },

    // FIXME: czy to jest w ogóle wykorzystywane?
    authenticationSuccess() {
      this.globalNotify.info(this.t('authenticationSucceeded'));
      safeMethodExecution(this, 'set', 'isBusy', false);
    },

    // FIXME: move to viewModel
    authenticationFailure({ error }) {
      safeMethodExecution(this, 'set', 'isBusy', false);
      const { isFatal, reason } = this.loginViewModel.parseFormError(error);
      if (isFatal) {
        set(this.loginViewModel, 'authenticationErrorReason', reason);
        this.set('showAuthenticationError', true);
      }
    },

    backFromError() {
      this.set('showAuthenticationError', false);
    },
  },
});
