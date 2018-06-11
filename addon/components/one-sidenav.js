/**
 * Application side menu component.
 *
 * @module components/one-sidenav
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-sidenav';

export default Component.extend({
  layout,
  classNames: ['one-sidenav', 'sidenav'],
  classNameBindings: ['opened:in'],
  attributeBindings: ['style'],

  /**
   * @type {boolean}
   */
  opened: false,
});
