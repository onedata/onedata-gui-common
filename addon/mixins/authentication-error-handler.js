/**
 * Adds functions to consume authentication error information (currently from cookies)
 *
 * @module mixins/authentication-error-handler
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

const authenticationErrorReasonKey = 'authentication_error_reason';
const authenticationErrorStateKey = 'authentication_error_state';

export default Mixin.create({
  cookies: service(),

  /**
   * Gets, clears and returns authentication error information from cookies.
   *
   * - `authenticationErrorReason` is the error code with optional parameter part.
   *   Possible error codes can be found in `locales/en/mixins/authentication-error-messages`
   *   or in `authentication-error-message` mixin, which can get additional
   *   parameter to displayed reason (see its implementation).
   * - `authenticationErrorState` is the token that identifies the occured error
   *   in backend. It can be send to server administrator to check what happened
   *   in server logs.
   *
   * @returns {Object} `{ authenticationErrorReason, authenticationErrorState }`
   */
  consumeAuthenticationError() {
    const cookies = this.get('cookies');
    const authenticationErrorReason = cookies.read(authenticationErrorReasonKey);
    const authenticationErrorState = cookies.read(authenticationErrorStateKey);
    const errors = {
      authenticationErrorReason,
      authenticationErrorState,
    };
    cookies.clear(authenticationErrorReasonKey, { path: '/' });
    cookies.clear(authenticationErrorStateKey, { path: '/' });
    return errors;
  },
});
