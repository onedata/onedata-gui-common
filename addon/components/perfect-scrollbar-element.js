import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/perfect-scrollbar-element';

import { PerfectScrollbarMixin } from 'ember-perfect-scrollbar';

export default Ember.Component.extend(PerfectScrollbarMixin, {
  layout,

  /**
   * Scroll event handler
   * @type {function}
   */
  onScroll: () => {},

  didInsertElement() {
    this._super(...arguments);

    const onScroll = this.get('onScroll');
    this.$()
      .on('ps-scroll-y', onScroll)
      .on('ps-scroll-x', onScroll);
  },

  willDestroyElement() {
    try {
      const onScroll = this.get('onScroll');
      this.$()
        .off('ps-scroll-y', onScroll)
        .off('ps-scroll-x', onScroll);
    } finally {
      this._super(...arguments);
    }
  }
});
