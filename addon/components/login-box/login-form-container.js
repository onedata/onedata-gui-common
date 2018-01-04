/**
 * A container component for login form.
 *
 * @module components/login-box/login-form-container
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/login-box/login-form-container';

export default Component.extend({
  layout,

  /**
   * Action called on login success.
   * @virtual
   * @type {function}
   */
  authenticationSuccess: () => {},

  /**
   * Action called on login failure.
   * @virtual
   * @type {function}
   */
  authenticationFailure: () => {},

  /**
   * Action called when login has started and is in progress.
   * @virtual
   * @type {function}
   */
  authenticationStarted: () => {},
});
