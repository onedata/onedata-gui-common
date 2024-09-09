// FIXME: jsdoc

import EmberObject from '@ember/object';
import AuthenticationErrorMessage from 'onedata-gui-common/mixins/authentication-error-message';
import { underscore } from '@ember/string';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { get } from '@ember/object';

/**
 * When one of these error occurs after username and password sign-in, that means
 * user should not try other password, because invalid form data is not the problem.
 */
const fatalBasicAuthErrors = Object.freeze([
  'basicAuthNotSupported',
  'basicAuthDisabled',
  'userBlocked',
]);

const mixins = [
  OwnerInjector,
  AuthenticationErrorMessage,
];

export default EmberObject.extend(...mixins, {
  authenticationErrorReason: undefined,
  authenticationErrorState: undefined,
  // FIXME: session.data.hasExpired?
  sessionHasExpired: undefined,

  // FIXME: przenieść do commona
  /**
   * @param {Object} error
   * @returns {BasicAuthErrorInfo}
   */
  parseFormError(error) {
    let reason;
    let isFatal = false;
    const errorId = error && get(error, 'details.authError.id');
    if (fatalBasicAuthErrors.includes(errorId)) {
      reason = underscore(errorId);
      isFatal = true;
    } else if (errorId === 'badBasicCredentials') {
      reason = underscore(errorId);
    } else {
      reason = 'unknown';
      isFatal = true;
    }
    return {
      isFatal,
      message: this.errorReasonToText(reason),
      reason,
    };
  },
});
