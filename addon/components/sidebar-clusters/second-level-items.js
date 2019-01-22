import SecondLevelItems from 'onedata-gui-common/components/two-level-sidebar/second-level-items';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar/second-level-items';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default SecondLevelItems.extend(I18n, {
  layout,

  i18nPrefix: 'components.sidebarClusters.secondLevelItems',

  item: undefined,

  isNotDeployedCluster: reads('item.isNotDeployed'),

  clusterType: reads('item.type'),

  dnsValid: true,

  webCertValid: true,

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

  certificateItem: computed('webCertValid', function certificateItem() {
    return {
      id: 'certificate',
      label: this.t('certificate'),
      icon: 'certificate',
      warningMessage: this.get('webCertValid') === false ?
        this.t('webCertWarning') : undefined,
    };
  }),

  credentialsItem: computed(function credentialsItem() {
    return {
      id: 'credentials',
      label: this.t('credentials'),
      icon: 'user',
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

  clusterSecondLevelItems: computed(
    'isNotDeployedCluster',
    'clusterType',
    'dnsItem',
    'certificateItem',
    'credentialsItem',
    'nodesItem',
    'overviewItem',
    'providerItem',
    'storagesItem',
    'spacesItem',
    function () {
      if (this.get('isNotDeployedCluster')) {
        return [];
      } else {
        const {
          clusterType,
          dnsItem,
          certificateItem,
          credentialsItem,
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
          'credentialsItem',
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
          credentialsItem,
        ];
        return clusterType === 'onezone' ? commonItems : [
          ...commonItems,
          providerItem,
          storagesItem,
          spacesItem,
        ];
      }
    }
  ),

  init() {
    this._super(...arguments);
    // overwrite injected property
    this.set('internalSecondLevelItems', reads('clusterSecondLevelItems'));
    console.log(this.get('item'));
  },
});
