/**
 * Renders user info content.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../templates/components/user-info-content';

export default Component.extend(I18n, {
  layout,
  classNames: ['user-info-content'],

  /**
   * @override
   */
  i18nPrefix: 'components.userInfoContent',

  /**
   * @virtual
   * @type {UserRecord}
   */
  record: undefined,

  /**
   * @virtual optional
   * @type {Object}
   */
  errorReason: undefined,
});
