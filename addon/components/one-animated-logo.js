/**
 * Displays animated version of Onedata logo.
 *
 * @module components/one-animated-logo
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-animated-logo';

export default Component.extend({
  layout,
  classNames: ['one-animated-logo'],
  classNameBindings: ['opened'],

  /**
   * If true, then logo is expanded, otherwise it is collapsed.
   * @virtual
   */
  opened: false,
});
