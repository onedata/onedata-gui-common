/**
 * A first-level item component for clusters sidebar
 *
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
import { collect } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  layout,

  tagName: '',

  i18n: service(),
  router: service(),
  globalClipboard: service(),
  clipboardActions: service(),

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

  /**
   * Set by `offlineObserver` because of nasty double render bug
   * @type {boolean}
   */
  pending: true,

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

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  itemActions: collect('copyIdAction', 'copyDomainAction'),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('cluster', function copyIdAction() {
    const {
      cluster,
      clipboardActions,
    } = this.getProperties('cluster', 'clipboardActions');

    return clipboardActions.createCopyRecordIdAction({ record: cluster });
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyDomainAction: computed(function copyDomainAction() {
    return {
      action: () => this.get('globalClipboard').copy(
        this.get('item.domain'),
        this.t('clusterDomain')
      ),
      title: this.t('copyDomainAction'),
      class: 'copy-cluster-domain-action-trigger',
      icon: 'browser-copy',
    };
  }),

  offlineObserver: observer('cluster.isOnline', function offlineObserver() {
    next(() => {
      const clusterIsOnline = this.get('cluster.isOnline');
      safeExec(this, 'setProperties', {
        offline: clusterIsOnline === false,
        pending: clusterIsOnline == null,
      });
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
