/**
 * Provides information about status of global collapsible toolbar component
 *
 * @module services/global-collapsible-toolbar
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

export default Ember.Service.extend({
  isToggleVisible: false,
  toggleClassName: 'collapsible-toolbar-global-toggle',
  isDropdownOpened: false,
});
