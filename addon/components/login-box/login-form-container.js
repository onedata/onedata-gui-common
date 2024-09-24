/**
 * A container component for login form.
 *
 * In common, it's only a form for username/password.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/login-box/login-form-container';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/i18n';

const mixins = [
  I18n,
];

export default Component.extend(...mixins, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.loginBox.loginFormContainer',

  /**
   * @virtual
   * @type {Utils.LoginViewModel}
   */
  loginViewModel: undefined,

  /**
   * Action called on login success.
   * @virtual
   * @type {function}
   */
  authenticationSuccess: notImplementedIgnore,

  /**
   * Action called on login failure.
   * @virtual
   * @type {function}
   */
  authenticationFailure: notImplementedIgnore,

  /**
   * Action called when login has started and is in progress.
   * @virtual
   * @type {function}
   */
  authenticationStarted: notImplementedIgnore,
});
