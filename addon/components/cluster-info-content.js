/**
 * Content of popup with information about cluster
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../templates/components/cluster-info-content';

export default Component.extend(I18n, {
  layout,
  classNames: ['cluster-info-content'],

  /**
   * @override
   */
  i18nPrefix: 'components.clusterInfoContent',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  record: undefined,
});
