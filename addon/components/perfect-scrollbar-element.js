/**
 * Container component, that provides PerfectScrollbar mechanism.
 *
 * @module components/perfect-scrollbar-element
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/perfect-scrollbar-element';
import { debounce } from '@ember/runloop';
import PerfectScrollbarMixin from 'onedata-gui-common/mixins/perfect-scrollbar';
import WindowResizeHandler from 'onedata-gui-common/mixins/components/window-resize-handler';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(PerfectScrollbarMixin, WindowResizeHandler, {
  classNames: ['perfect-scrollbar-element'],
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
   * @virtual optional
   * @type {Function}
   */
  onScroll: notImplementedIgnore,

  /**
   * Called when scroll reached the top or it just moved down from the top
   * @virtual optional
   * @type {Function}
   * @param {boolean} reachedEdge true if reached edge, false if left it
   * @returns {any}
   */
  onTopEdgeScroll: notImplementedIgnore,

  /**
   * Called when scroll reached the bottom or it just moved up from the bottom
   * @virtual optional
   * @type {Function}
   * @param {boolean} reachedEdge true if reached edge, false if left it
   * @returns {any}
   */
  onBottomEdgeScroll: notImplementedIgnore,

  /**
   * @type {boolean}
   */
  isScrolledTop: false,

  /**
   * @type {boolean}
   */
  isScrolledBottom: false,

  /**
   * @type {boolean}
   */
  hasActiveTouchScroll: false,

  /**
   * @override
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
   * @type {ComputedProperty<Function>}
   */
  detectReachingStartEndHandler: computed(function detectReachingStartEndHandler() {
    return this.detectReachingStartEnd.bind(this);
  }),

  /**
   * @type {ComputedProperty<Function>}
   */
  touchEndHandler: computed(function touchEndHandler() {
    return () => {
      this.set('hasActiveTouchScroll', false);
    };
  }),

  didInsertElement() {
    this._super(...arguments);

    const {
      onScroll,
      detectReachingStartEndHandler,
      touchEndHandler,
    } = this.getProperties(
      'class',
      'onScroll',
      'detectReachingStartEndHandler',
      'touchEndHandler'
    );

    this.$()
      .on('ps-scroll-y', onScroll)
      .on('ps-scroll-x', onScroll)
      .on('scroll transitionend touchmove', detectReachingStartEndHandler)
      .on('touchend', touchEndHandler);
  },

  willDestroyElement() {
    try {
      const {
        onScroll,
        detectReachingStartEndHandler,
        touchEndHandler,
      } = this.getProperties(
        'onScroll',
        'detectReachingStartEndHandler',
        'touchEndHandler'
      );

      this.$()
        .off('ps-scroll-y', onScroll)
        .off('ps-scroll-x', onScroll)
        .off('scroll transitionend touchmove', detectReachingStartEndHandler)
        .off('touchend', touchEndHandler);
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  didRender() {
    this._super(...arguments);
    this.detectReachingStartEnd();
  },

  /**
   * @override
   */
  onWindowResize() {
    debounce(this, 'updateScrollbar', 100);
  },

  /**
   * @override
   */
  updateScrollbar() {
    const result = this._super(...arguments);
    this.detectReachingStartEnd();
    return result;
  },

  detectReachingStartEnd(event) {
    const {
      isScrolledTop,
      isScrolledBottom,
      onTopEdgeScroll,
      onBottomEdgeScroll,
    } = this.getProperties(
      'isScrolledTop',
      'isScrolledBottom',
      'onTopEdgeScroll',
      'onBottomEdgeScroll',
    );
    const $element = this.$();
    const element = $element && this.$()[0];

    if (!element) {
      return;
    }

    const isNowScrolledTop = element.scrollTop <= 0;
    const isNowScrolledBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight;

    if (isScrolledTop !== isNowScrolledTop) {
      this.set('isScrolledTop', isNowScrolledTop);
      $element
        .toggleClass('on-top', isNowScrolledTop)
        .trigger('top-edge-scroll-change');
      if (typeof onTopEdgeScroll === 'function') {
        onTopEdgeScroll(isNowScrolledTop);
      }
    }
    if (isScrolledBottom !== isNowScrolledBottom) {
      this.set('isScrolledBottom', isNowScrolledBottom);
      $element
        .toggleClass('on-bottom', isNowScrolledBottom)
        .trigger('bottom-edge-scroll-change');
      if (typeof onTopEdgeScroll === 'function') {
        onBottomEdgeScroll(isNowScrolledBottom);
      }
    }

    if (event && event.type === 'touchmove') {
      if (
        // any scroll starting from the middle of content
        (!isScrolledTop && !isScrolledBottom) ||
        // or any scroll, that was on the top and moved down
        isScrolledTop !== isNowScrolledTop ||
        // or any scroll, that was on the bottom and moved up
        isScrolledBottom !== isNowScrolledBottom
      ) {
        this.set('hasActiveTouchScroll', true);
        // any other scroll (so being on the edge and scroll outside) will not set
        // `hasActiveTouchScroll` to true
      }

      if (this.get('hasActiveTouchScroll')) {
        // prevent parents from scrolling when this element has active touch scroll
        event.stopPropagation();
      }
    }
  },

  actions: {
    scrollTop() {
      return this.$().scrollTop(...arguments);
    },
  },
});
