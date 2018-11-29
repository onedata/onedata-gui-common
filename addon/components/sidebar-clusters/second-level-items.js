import SecondLevelItems from 'onedata-gui-common/components/two-level-sidebar/second-level-items';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar/second-level-items';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default SecondLevelItems.extend(I18n, {
  layout,

  i18nPrefix: 'components.sidebarClusters.secondLevelItems',

  item: undefined,

  overviewItem: computed(function overviewItem() {
    return {
      id: 'overview',
      label: this.t('overview'),
      icon: 'overview',
    };
  }),

  dnsItem: computed('dnsValid', function dnsItem() {
    return {
      id: 'dns',
      label: this.t('dns'),
      icon: 'globe-cursor',
      warningMessage: this.get('dnsValid') === false ?
        this.t('dnsWarning') : undefined,
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

  clusterType: reads('item.type'),

  clusterSecondLevelItems: computed(
    'clusterType',
    'dnsItem',
    'certificateItem',
    'nodesItem',
    'overviewItem',
    'providerItem',
    'storagesItem',
    'spacesItem',
    function () {
      const {
        clusterType,
        dnsItem,
        certificateItem,
        nodesItem,
        overviewItem,
        providerItem,
        storagesItem,
        spacesItem,
      } = this.getProperties(
        'clusterType',
        'cluster',
        'dnsItem',
        'certificateItem',
        'nodesItem',
        'overviewItem',
        'providerItem',
        'storagesItem',
        'spacesItem',
      );
      const commonItems = [
        overviewItem,
        nodesItem,
        dnsItem,
        certificateItem,
      ];

      return clusterType === 'onezone' ? commonItems : [
        ...commonItems,
        providerItem,
        storagesItem,
        spacesItem,
      ];
    }
  ),

  init() {
    this._super(...arguments);
    // overwrite injected property
    this.set('secondLevelItems', reads('clusterSecondLevelItems'));
    console.log(this.get('secondLevelItems'));
  },
});
