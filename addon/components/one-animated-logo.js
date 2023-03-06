/**
 * Displays animated version of Onedata logo.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-animated-logo';

export default Component.extend({
  layout,
  classNames: ['one-animated-logo'],
  classNameBindings: ['opened:opened'],

  /**
   * If true, then logo is expanded, otherwise it is collapsed.
   * @virtual
   */
  opened: false,
});
