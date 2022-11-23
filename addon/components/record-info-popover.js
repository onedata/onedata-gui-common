/**
 * Renders record info popover.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/record-info-popover';

export default Component.extend({
  layout,
  tagName: '',

  classNames: ['record-info-popover'],

  /**
   * @virtual
   * @type {String}
   */
  triggerSelector: undefined,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  isOpened: false,
});
