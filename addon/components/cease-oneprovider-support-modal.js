/**
 * Shows modal asking about ceasing support of Oneprovider from space
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/cease-oneprovider-support-modal';

export default Component.extend(I18n, {
  layout,
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.ceaseOneproviderSupportModal',

  /**
   * @virtual
   * @type {boolean}
   */
  opened: false,

  /**
   * @virtual optional
   * @type {Function}
   */
  removeSpaceClick: notImplementedIgnore,

  /**
   * @virtual optional
   * @type {String}
   */
  removeSpaceUrl: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  close: notImplementedIgnore,
});
