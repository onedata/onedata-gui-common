/**
 * Common layout for login view
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/login-layout';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  layout,
  classNames: ['login-layout'],

  guiUtils: service(),
  guiMessageManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.loginLayout',

  /**
   * @type {ComputedProperty<object>}
   */
  softwareVersionDetails: reads('guiUtils.softwareVersionDetails'),
});
