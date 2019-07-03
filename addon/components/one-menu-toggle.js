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
