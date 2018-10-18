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
   * @return {Object} `{ authenticationErrorReason, authenticationErrorState }`
   */
  consumeAuthenticationError() {
    const cookies = this.get('cookies');
    const authenticationErrorReason = cookies.read(authenticationErrorReasonKey);
    const authenticationErrorState = cookies.read(authenticationErrorStateKey);
    const errors = {
      authenticationErrorReason,
      authenticationErrorState,
    };
    cookies.clear(authenticationErrorReasonKey);
    cookies.clear(authenticationErrorStateKey);
    return errors;
  },
});
