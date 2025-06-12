/**
 * Intercepts `submit` event from forms that could cause default browser redirection.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

export default {
  name: 'prevent-submit-redirection',

  initialize: () => {
    globals.document.addEventListener('submit', (event) => {
      event.preventDefault();
    });
  },
};
