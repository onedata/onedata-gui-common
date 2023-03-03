/**
 * A sidebar for account settings
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

export default OneSidebar.extend({
  layout,

  classNames: ['sidebar-account'],

  firstLevelItemIcon: 'user',

  secondLevelItems: computed(() => []).readOnly(),
});
