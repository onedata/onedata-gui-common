import Component from '@ember/component';
import layout from '../templates/components/one-pill-button';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: 'one-pill-button',
  classNameBindings: ['mobileMode:mobile-mode'],
  layout,

  /**
   * @virtual
   * @type {Array<object>}
   */
  menuItems: undefined,

  /**
   * @type {boolean}
   */
  mobileMode: false,

  arrowIcon: computed('mobileMode', function arrowIcon() {
    return this.get('mobileMode') ? 'arrow-up' : 'arrow-down';
  }),

  actions: {
    toggleActions(open) {
      const _open = (typeof open === 'boolean') ? open : !this.get('actionsOpen');
      this.set('actionsOpen', _open);
    },
  },
});
