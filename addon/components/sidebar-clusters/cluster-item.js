/**
 * A first-level item component for clusters sidebar
 *
 * @module components/sidebar-clusters/group-item
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import layout from 'onedata-gui-common/templates/components/sidebar-clusters/cluster-item';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  layout,

  tagName: '',

  i18n: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters.clusterItem',

  /**
   * @virtual
   * @type {Cluster}
   */
  item: undefined,

  /**
   * @type {Ember.ComputedProperty<models/Cluster>}
   */
  cluster: reads('item'),

  type: reads('cluster.type'),

  /**
   * Set by `offlineObserver` because of nasty double render bug
   * @type {boolean}
   */
  offline: undefined,

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

  offlineObserver: observer('cluster.isOnline', function offlineObserver() {
    next(() => {
      safeExec(this, 'set', 'offline', !this.get('cluster.isOnline'));
    });
  }),

  init() {
    this._super(...arguments);
    const cluster = this.get('cluster');
    this.offlineObserver();
    // if this is new cluster (not a real cluster), skip updateIsOnlineProxy
    if (cluster.updateIsOnlineProxy) {
      cluster.updateIsOnlineProxy();
    }
  },

  // TODO: unfinished code for deregister in menu of cluster item
  // - should be presented only for Oneprovider clusters
  // - should be also available in Onepanel menu

  // deregisterAction: computed(function deregisterAction() {
  //   return {
  //     action: () => this.get('router').transitionTo(
  //       'onedata.sidebar.content.aspect',
  //       'clusters',
  //       this.get('cluster.entityId'),
  //       'deregister'
  //     ),
  //     title: this.t('deregister'),
  //     class: 'deregister-oneprovider-action',
  //     icon: 'remove',
  //   };
  // }),

  // itemActions: computed('deregisterAction', function itemActions() {
  //   return [
  //     this.get('deregisterAction'),
  //   ];
  // }),
});
