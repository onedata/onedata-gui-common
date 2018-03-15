/**
 * Container component, that provides PerfectScrollbar mechanism.
 *
 * @module components/perfect-scrollbar-element
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/perfect-scrollbar-element';

import { PerfectScrollbarMixin } from 'ember-perfect-scrollbar';

export default Component.extend(PerfectScrollbarMixin, {
  layout,

  /**
   * @type {boolean}
   */
  suppressScrollX: false,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  perfectScrollbarOptions: computed('suppressScrollX', function () {
    const suppressScrollX = this.get('suppressScrollX');
    return {
      suppressScrollX,
    };
  }),

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
