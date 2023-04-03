/**
 * Injects i18n service into some factories. See initialize function for details.
 *
 * @author Jakub Liput
 * @copyright (C) 2016-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default {
  name: 'pointer-events',

  initialize: function (application) {
    application.inject('component', 'pointerEvents', 'service:pointer-events');
    application.inject('controller', 'pointerEvents', 'service:pointer-events');
  },
};
