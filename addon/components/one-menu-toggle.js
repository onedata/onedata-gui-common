/**
 * A hamburger menu to use in various places.
 * To use `on-hover` class, please add a `menu-toggle-hover-parent`
 * class to some larger element that will be hovered.
 * 
 * @module components/one-menu-toggle
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-menu-toggle';

export default Component.extend({
  layout,
  classNames: ['one-menu-toggle', 'menu-toggle'],
  classNameBindings: ['showOnHover:on-hover', 'disabled:disabled'],
  attributeBindings: ['disabled'],

  showOnHover: false,

  disabled: false,
});
