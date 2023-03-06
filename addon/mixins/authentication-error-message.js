/**
 * Adds a translated `authenticationErrorText` based on authentication error code
 *
 * @author Jakub Liput
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import _ from 'lodash';
import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * List of known authentication errors
 */
const authenticationErrors = [
  'bad_auth_config',
  'invalid_state',
  'invalid_auth_request',
  'idp_unreachable',
  'bad_idp_response',
  'cannot_resolve_required_attribute',
  'internal_server_error',
  'account_already_linked_to_another_user',
  'account_already_linked_to_current_user',
  'user_blocked',
  'basic_auth_not_supported',
  'basic_auth_disabled',
];

function stripError(authenticationError) {
  let errorCode = authenticationError;
  let errorAttribute;
  if (/^.*?:.*/.test(errorCode)) {
    [errorCode, errorAttribute] = errorCode.split(':');
  }
  if (!_.includes(authenticationErrors, errorCode)) {
    errorCode = 'unknown';
  }
  return [errorCode, errorAttribute];
}

export default Mixin.create(I18n, {
  /**
   * @override
   */
  i18nPrefix: 'mixins.authenticationErrorMessage',

  /**
   * One of AUTHENTICATION_ERRORS
   * @type {string}
   */
  authenticationErrorReason: undefined,

  authenticationErrorText: computed('authenticationErrorReason',
    function authenticationErrorText() {
      const authenticationErrorReason = this.get('authenticationErrorReason');
      if (authenticationErrorReason) {
        const [errorCode, errorAttribute] = stripError(authenticationErrorReason);
        return this.t(`codes.${errorCode}`, {
          attribute: errorAttribute,
        });
      }
    }),

  showErrorContactInfo: computed('authenticationErrorReason', 'authenticationErrorState',
    function showErrorContactInfo() {
      const {
        authenticationErrorReason,
        authenticationErrorState,
      } = this.getProperties('authenticationErrorReason', 'authenticationErrorState');
      return authenticationErrorState && ![
        'account_already_linked_to_another_user',
        'account_already_linked_to_current_user',
        'user_blocked',
        'basic_auth_not_supported',
        'basic_auth_disabled',
      ].includes(authenticationErrorReason);
    }),
});
