/**
 * A sidebar for clusters (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TwoLevelSidebar.extend(I18n, {
  layout,

  classNames: ['sidebar-clusters'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters',

  /**
   * @override
   */
  sorting: Object.freeze(['type:desc', 'name']),

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-clusters/cluster-item',

  /**
   * @implements TwoLevelSidebar
   */
  sidebarType: 'clusters',
});
