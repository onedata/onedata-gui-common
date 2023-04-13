/**
 * Content of popup with information about provider
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from '../templates/components/provider-info-content';

export default Component.extend(I18n, {
  layout,

  classNames: ['provider-info-content'],

  /**
   * @override
   */
  i18nPrefix: 'components.providerInfoContent',

  /**
   * @virtual
   * @type {Models.Provider}
   */
  record: undefined,
});
