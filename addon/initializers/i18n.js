/**
 * Injects i18n service into some factories. See initialize function for details.
 *
 * @author Jakub Liput
 * @copyright (C) 2016-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default {
  name: 'i18n',

  after: 'ember-i18n',

  initialize: function (application) {
    application.inject('component', 'i18n', 'service:i18n');
    application.inject('route', 'i18n', 'service:i18n');
  },
};
