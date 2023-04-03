/**
 * Provides information about status of global collapsible toolbar component
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';

export default Service.extend({
  isToggleVisible: false,
  toggleClassName: 'collapsible-toolbar-global-toggle',
  isDropdownOpened: false,
  showInMobileSidebar: false,
});
