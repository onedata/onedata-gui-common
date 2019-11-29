/**
 * A sidebar for clusters (extension of `one-sidebar`)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default OneSidebar.extend(I18n, {
  layout,

  classNames: ['sidebar-clusters'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters',

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-clusters/cluster-item',

  /**
   * @override
   */
  secondLevelItemsComponent: 'sidebar-clusters/second-level-items',

  /**
   * @implements OneSidebar
   */
  sidebarType: 'clusters',
});
