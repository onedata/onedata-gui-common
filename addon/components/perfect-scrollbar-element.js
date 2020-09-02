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
import _ from 'lodash';

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
   * Called when scroll reached the left edge or it just moved right from the edge
   * @virtual optional
   * @type {Function}
   * @param {boolean} reachedEdge true if reached edge, false if left it
   * @returns {any}
   */
  onLeftEdgeScroll: notImplementedIgnore,

  /**
   * Called when scroll reached the right edge or it just moved left from the edge
   * @virtual optional
   * @type {Function}
   * @param {boolean} reachedEdge true if reached edge, false if left it
   * @returns {any}
   */
  onRightEdgeScroll: notImplementedIgnore,

  /**
   * @type {boolean}
   */
  isScrolledTop: true,

  /**
   * @type {boolean}
   */
  isScrolledBottom: true,

  /**
   * @type {boolean}
   */
  isScrolledLeft: true,

  /**
   * @type {boolean}
   */
  isScrolledRight: true,

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

  /**
   * It does not observe any property to not recalculate callback references
   * @type {ComputedProperty<Array<{ eventName: String, handler: Function }>>}
   */
  eventListeners: computed(function eventListeners() {
    const {
      onScroll,
      detectReachingStartEndHandler,
      touchEndHandler,
    } = this.getProperties(
      'onScroll',
      'detectReachingStartEndHandler',
      'touchEndHandler',
    );

    return [{
      eventName: 'ps-scroll-y',
      handler: onScroll,
    }, {
      eventName: 'ps-scroll-x',
      handler: onScroll,
    }, {
      eventName: 'scroll',
      handler: detectReachingStartEndHandler,
      passive: true,
    }, {
      eventName: 'transitionend',
      handler: detectReachingStartEndHandler,
    }, {
      eventName: 'touchmove',
      handler: detectReachingStartEndHandler,
      passive: true,
    }, {
      eventName: 'touchend',
      handler: touchEndHandler,
    }];
  }),

  didInsertElement() {
    this._super(...arguments);

    const {
      eventListeners,
      element,
    } = this.getProperties(
      'class',
      'eventListeners',
      'element'
    );

    eventListeners.forEach(({ eventName, handler, passive }) =>
      element.addEventListener(eventName, handler, passive ? { passive: true } : false)
    );
  },

  willDestroyElement() {
    try {
      const {
        eventListeners,
        element,
      } = this.getProperties(
        'class',
        'eventListeners',
        'element'
      );

      eventListeners.forEach(({ eventName, handler }) =>
        element.removeEventListener(eventName, handler)
      );
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
      element,
    } = this.getProperties(
      'isScrolledTop',
      'isScrolledBottom',
      'element',
    );

    if (!element) {
      return;
    }

    const isNowScrolledTop = element.scrollTop <= 0;
    const isNowScrolledBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight;
    const isNowScrolledLeft = element.scrollLeft <= 0;
    const isNowScrolledRight =
      element.scrollLeft + element.clientWidth >= element.scrollWidth;

    [
      { side: 'top', isNowScrolledToEdge: isNowScrolledTop },
      { side: 'bottom', isNowScrolledToEdge: isNowScrolledBottom },
      { side: 'left', isNowScrolledToEdge: isNowScrolledLeft },
      { side: 'right', isNowScrolledToEdge: isNowScrolledRight },
    ].forEach(({ side, isNowScrolledToEdge }) => {
      const sideWithUpperFirst = _.upperFirst(side);
      const wasScrolledPropName = `isScrolled${sideWithUpperFirst}`;
      const onScrollChangeCallback = this.get(`on${sideWithUpperFirst}EdgeScroll`);

      element.classList.toggle(`on-${side}`, isNowScrolledToEdge);
      if (this.get(wasScrolledPropName) !== isNowScrolledToEdge) {
        this.set(wasScrolledPropName, isNowScrolledToEdge);
        element.dispatchEvent(new Event(`${side}-edge-scroll-change`));
        if (typeof onScrollChangeCallback === 'function') {
          onScrollChangeCallback(isNowScrolledToEdge);
        }
      }
    });

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
        // `hasActiveTouchScroll` to true.
        // Also any horizontal scroll is not checked, because we do not have any existing
        // examples of nested horizontal scrollbars. If such exist in the future,
        // the algorithm will have to be way more complex.
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
