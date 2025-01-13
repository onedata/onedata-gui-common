/**
 * A sidebar for clusters (extension of `one-sidebar`)
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import { classNames, layout } from '@ember-decorators/component';

@layout(template)
@classNames('sidebar-clusters')
export default class SidebarClusters extends OneSidebar {
  /**
   * @override
   */
  i18nPrefix = 'components.sidebarClusters';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-clusters/cluster-item';

  /**
   * @override
   */
  secondLevelItemsComponent = 'sidebar-clusters/second-level-items';

  /**
   * @implements OneSidebar
   */
  sidebarType = 'clusters';

  /**
   * @override
   */
  get primaryItemHeight() {
    return 330;
  }
}
