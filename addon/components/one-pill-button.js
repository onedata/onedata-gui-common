import Component from '@ember/component';
import layout from '../templates/components/one-pill-button';

export default Component.extend({
  classNames: 'one-pill-button',
  layout,

  /**
   * @virtual
   * @type {Array<object>}
   */
  menuItems: undefined,

  actions: {
    toggleActions(open) {
      const _open = (typeof open === 'boolean') ? open : !this.get('actionsOpen');
      this.set('actionsOpen', _open);
    },
  },
});
