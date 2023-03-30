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
import { computed } from '@ember/object';

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

  /**
   * @virtual optional
   * @type {string}
   */
  linkToCluster: undefined,

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clusterType: computed('record.type', function clusterType() {
    if (this.record.type) {
      return this.t(this.record.type, {}, {
        defaultValue: this.record.type,
      });
    } else {
      return '—';
    }
  }),
});
