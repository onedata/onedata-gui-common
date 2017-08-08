/**
 * A status icon for use in status-toolbar container
 *
 * @module components/status-icon
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/status-icon';

export default Ember.Component.extend({
  layout,
  classNames: ['status-icon'],
  classNameBindings: ['status-icon', 'status', 'enabled::hidden'],

  hint: null,

  enabled: true,

  /**
   * To inject.
   * @type {string}
   */
  type: null,

  /**
   * To inject.
   * @type {string}
   */
  status: null,
});
