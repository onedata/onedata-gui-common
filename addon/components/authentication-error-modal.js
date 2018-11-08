/**
 * Shows information about authentication error after last attempt to connect
 * new account.
 * 
 * @module components/authentication-error-modal
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import AuthenticationErrorMessage from 'onedata-gui-common/mixins/authentication-error-message';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import layout from 'onedata-gui-common/templates/components/authentication-error-modal';

export default Component.extend(AuthenticationErrorMessage, {
  layout,

  /**
   * @virtual
   * @type {function}
   */
  close: notImplementedThrow,

  opened: false,

  actions: {
    close() {
      this.get('close')();
    },
  },
});
