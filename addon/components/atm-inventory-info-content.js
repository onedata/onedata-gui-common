/**
 * Content of popup with information about automation inventory
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../templates/components/atm-inventory-info-content';

export default Component.extend(I18n, {
  layout,
  classNames: ['atm-inventory-info-content'],

  /**
   * @override
   */
  i18nPrefix: 'components.atmInventoryInfoContent',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  record: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  showDetails: true,

  /**
   * @virtual optional
   * @type {string}
   */
  linkToAtmInventory: undefined,
});
