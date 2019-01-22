/**
 * A sidebar for clusters (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-clusters
 * @author Jakub Liput
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TwoLevelSidebar.extend(I18n, {
  layout,

  classNames: ['sidebar-clusters'],

  i18nPrefix: 'components.sidebarClusters',

  /**
   * @override
   */
  sorting: Object.freeze(['type:desc', 'name']),

  // TODO this will not work in generic multi-clusters menu  
  cluster: reads('model.collection.list.firstObject'),

  firstLevelItemComponent: 'sidebar-clusters/cluster-item',

  secondLevelItemsComponent: 'sidebar-clusters/second-level-items',

  /**
   * @implements TwoLevelSidebar
   */
  sidebarType: 'clusters',
});
