/**
 * Renders flippable icons, after hover on specific elements 
 * front icon changes into back icon(info icon by default).
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/flippable-icons';

export default Component.extend({
  layout,
  classNames: ['flippable-icons', 'clickable'],

  /**
   * @virtual
   * @type {String}
   */
  iconName: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  backIconName: 'browser-info',

  /**
   * @virtual optional
   * @type {String}
   */
  iconColor: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isHovered: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  suppressFlipping: false,

  /**
   * @virtual optional
   * @type {String}
   */
  iconTag: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  iconTaggedClass: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  iconClass: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  iconTip: undefined,

  /**
   * @virtual optional
   * @type {String}
   */
  shadowType: 'circle',
});
