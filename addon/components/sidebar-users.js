/**
 * A sidebar for account settings
 *
 * @module components/sidebar-account
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-account'],

  firstLevelItemIcon: 'user',

  triggerEventOnPrimaryItemSelection: true,

  secondLevelItems: computed(() => []).readOnly(),
});
