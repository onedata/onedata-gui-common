/**
 * A component with information about no shares available
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../templates/components/content-shares-empty';

export default Component.extend(I18n, {
  layout,
  classNames: ['content-shares-empty'],
  i18nPrefix: 'components.contentSharesEmpty',

  /**
   * @virtual optional
   * Can be used on space-mode view to show link to data tab to current space
   * @type {String}
   */
  dataTabUrl: undefined,

  forSpace: false,
});
