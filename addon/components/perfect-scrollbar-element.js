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
import { debounce } from '@ember/runloop';
import { PerfectScrollbarMixin } from 'ember-perfect-scrollbar';

export default Component.extend(PerfectScrollbarMixin, {
  layout,

  /**
   * @type {boolean}
   */
  suppressScrollX: false,

  /**
   * @type {boolean}
   */
  suppressScrollY: false,

  /**
   * Scroll event handler
   * @type {function}
   */
  onScroll: () => {},

  /**
   * Window object (for testing purposes only)
   * @type {Window}
   */
  _window: window,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  perfectScrollbarOptions: computed(
    'suppressScrollX',
    'suppressScrollY',
    function () {
      return this.getProperties('suppressScrollX', 'suppressScrollY');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  windowResizeHandler: computed(function windowResizeHandler() {
    // Using internal PerfectScrollbarMixin method to update scrollbar on
    // window resize
    return () => debounce(this, this._resizePerfectScrollbar, 100);
  }),

  didInsertElement() {
    this._super(...arguments);

    this.get('class');

    const {
      onScroll,
      windowResizeHandler,
      _window,
    } = this.getProperties('onScroll', 'windowResizeHandler', '_window');

    _window.addEventListener('resize', windowResizeHandler);

    this.$()
      .on('ps-scroll-y', onScroll)
      .on('ps-scroll-x', onScroll);
  },

  willDestroyElement() {
    try {
      const {
        onScroll,
        windowResizeHandler,
        _window,
      } = this.getProperties('onScroll', 'windowResizeHandler', '_window');

      _window.removeEventListener('resize', windowResizeHandler);

      this.$()
        .off('ps-scroll-y', onScroll)
        .off('ps-scroll-x', onScroll);
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    scrollTop() {
      return this.$().scrollTop(...arguments);
    },
  },
});
