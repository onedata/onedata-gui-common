/**
 * Content of popup with information about provider
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import layout from '../templates/components/provider-info-content';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  layout,

  classNames: ['provider-info-content'],

  /**
   * @override
   */
  i18nPrefix: 'components.providerInfoContent',

  /**
   * @virtual
   * @type {Models.Provider|OneproviderTabItem}
   */
  record: undefined,

  /**
   * @type {string}
   */
  currentProviderId: undefined,

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCurrentProvider: computed(
    'currentProviderId',
    'record.entityId',
    function isCurrentProvider() {
      return this.currentProviderId === this.record.entityId;
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  badgeText: computed('isCurrentProvider', function badgeText() {
    return this.isCurrentProvider ? this.t('current') : this.t('remote');
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  badgeTipText: computed('isCurrentProvider', function badgeTipText() {
    return this.isCurrentProvider ? this.t('currentTip') : this.t('remoteTip');
  }),
});
