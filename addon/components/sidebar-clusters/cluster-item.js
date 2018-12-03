/**
 * A first-level item component for clusters sidebar
 *
 * @module components/sidebar-clusters/group-item
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/sidebar-clusters/cluster-item';

export default Component.extend(I18n, {
  layout,

  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters.clusterItem',

  /**
   * @type {Ember.ComputedProperty<models/Cluster>}
   */
  cluster: reads('item'),

  type: reads('cluster.type'),

  firstLevelItemIcon: computed('type', function firstLevelItemIcon() {
    switch (this.get('type')) {
      case 'oneprovider':
        return 'provider';
      case 'onezone':
        return 'onezone';
      default:
        return 'menu-clusters';
    }
  }),

  init() {
    this._super(...arguments);
    console.log(this.get('item'));
  },
});
