/**
 * Base View Model to use in components displaying login screen elements.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import AuthenticationErrorMessage from 'onedata-gui-common/mixins/authentication-error-message';
import { underscore } from '@ember/string';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';

const mixins = [
  OwnerInjector,
  AuthenticationErrorMessage,
];

export default EmberObject.extend(...mixins, {
  session: service(),

  /**
   * @virtual
   * @type {boolean}
   */
  sessionHasExpired: undefined,

  /**
   * @param {Object} error
   * @returns {BasicAuthErrorInfo}
   */
  parseFormError(error) {
    const errorId = error && (error.details?.authError?.id || error.id);
    const reason = errorId && underscore(errorId);
    const isFatal = (errorId !== 'badBasicCredentials');
    const message = reason && this.errorReasonToText(reason);
    return {
      isFatal,
      message,
      reason,
    };
  },

  async usernameAuthenticate(username, password) {
    await this.session.authenticate('authenticator:application', {
      username,
      password,
    });
  },
});
