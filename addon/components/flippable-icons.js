/**
 * Renders flippable icons, after hover on specific elements 
 * one icons change into info icons.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/flippable-icons';

export default Component.extend({
  layout,
  classNames: ['flippable-icons'],
  tagName: 'span',

  /**
   * @virtual
   * @type {String}
   */
  iconName: undefined,

  iconColor: undefined,

  /**
   * @type {boolean}
   */
  isHovered: false,

  shouldAnimated: true,
});
