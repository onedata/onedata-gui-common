/**
 * Second level sidebar items component base for clusters.
 * 
 * @module component/sidebar-cluster/second-level-items
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SecondLevelItems from 'onedata-gui-common/components/two-level-sidebar/second-level-items';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar/second-level-items';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default SecondLevelItems.extend(I18n, {
  layout,

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters.secondLevelItems',

  /**
   * @virtual
   */
  item: undefined,

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  cluster: reads('item'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  clusterType: reads('cluster.type'),

  overviewItem: computed(function overviewItem() {
    return {
      id: 'overview',
      label: this.t('overview'),
      icon: 'overview',
    };
  }),

  dnsItem: computed(function dnsItem() {
    return {
      id: 'dns',
      label: this.t('dns'),
      icon: 'globe-cursor',
    };
  }),

  certificateItem: computed(function certificateItem() {
    return {
      id: 'certificate',
      label: this.t('certificate'),
      icon: 'certificate',
    };
  }),

  nodesItem: computed(function nodesItem() {
    return {
      id: 'nodes',
      label: this.t('nodes'),
      icon: 'node',
    };
  }),

  providerItem: computed(function providerItem() {
    return {
      id: 'provider',
      label: this.t('provider'),
      icon: 'provider',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  cephItem: computed(function cephItem() {
    return {
      id: 'ceph',
      label: this.t('ceph'),
      icon: 'ceph',
    };
  }),

  storagesItem: computed(function storagesItem() {
    return {
      id: 'storages',
      label: this.t('storages'),
      icon: 'support',
    };
  }),

  spacesItem: computed(function spacesItem() {
    return {
      id: 'spaces',
      label: this.t('spaces'),
      icon: 'space',
    };
  }),

  membersItem: computed(function membersItem() {
    return {
      id: 'members',
      label: this.t('members'),
      icon: 'group',
    };
  }),

  clusterSecondLevelItems: computed(
    'clusterType',
    'dnsItem',
    'certificateItem',
    'nodesItem',
    'overviewItem',
    'providerItem',
    'cephItem',
    'storagesItem',
    'spacesItem',
    'membersItem',
    function clusterSecondLevelItems() {
      const {
        clusterType,
        dnsItem,
        certificateItem,
        nodesItem,
        overviewItem,
        providerItem,
        cephItem,
        storagesItem,
        spacesItem,
        membersItem,
      } = this.getProperties(
        'clusterType',
        'cluster',
        'dnsItem',
        'certificateItem',
        'nodesItem',
        'overviewItem',
        'providerItem',
        'cephItem',
        'storagesItem',
        'spacesItem',
        'membersItem'
      );
      if (!clusterType) {
        return [];
      } else {
        const commonItems = [
          overviewItem,
          nodesItem,
          dnsItem,
          certificateItem,
          membersItem,
        ];
        const items = clusterType === 'onezone' ? commonItems : [
          ...commonItems,
          providerItem,
          cephItem,
          storagesItem,
          spacesItem,
        ];
        return items;
      }
    }
  ),

  init() {
    this._super(...arguments);
    // overwrite injected property
    this.set('internalSecondLevelItems', reads('clusterSecondLevelItems'));
  },
});
