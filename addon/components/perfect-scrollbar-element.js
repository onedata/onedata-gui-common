/**
 * Container component, that provides PerfectScrollbar mechanism.
 *
 * @module components/perfect-scrollbar-element
 * @author Jakub Liput, Michał Borzęcki
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

const initialEdgeScrollState = Object.freeze({
  top: true,
  bottom: true,
  left: true,
  right: true,
});

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
   * Called when scroll reached any edge or it just moved from the edge
   * @virtual optional
   * @type {Function}
   * @param {Object} edgeScrollState see `edgeScrollState` property doc
   * @returns {any}
   */
  onEdgeScroll: notImplementedIgnore,

  /**
   * Indicates if scroll has reached specific edge.
   * @type {Object}
   */
  edgeScrollState: initialEdgeScrollState,

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
  detectEdgeScrollHandler: computed(function detectEdgeScrollHandler() {
    return this.detectEdgeScroll.bind(this);
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
      detectEdgeScrollHandler,
      touchEndHandler,
    } = this.getProperties(
      'onScroll',
      'detectEdgeScrollHandler',
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
      handler: detectEdgeScrollHandler,
      passive: true,
    }, {
      eventName: 'parentrender',
      handler: detectEdgeScrollHandler,
    }, {
      eventName: 'transitionend',
      handler: detectEdgeScrollHandler,
    }, {
      eventName: 'touchmove',
      handler: detectEdgeScrollHandler,
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
    this.detectEdgeScroll();
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
    this.detectEdgeScroll();
    return result;
  },

  detectEdgeScroll(event) {
    const {
      element,
      edgeScrollState: oldEdgeScrollState,
      onEdgeScroll,
    } = this.getProperties(
      'element',
      'edgeScrollState',
      'onEdgeScroll'
    );

    if (!element) {
      return;
    }

    const newEdgeScrollState = {
      top: element.scrollTop <= 0,
      bottom: element.scrollTop + element.clientHeight >= element.scrollHeight,
      left: element.scrollLeft <= 0,
      right: element.scrollLeft + element.clientWidth >= element.scrollWidth,
    };

    const edgeScrollHasChanged = Object.keys(newEdgeScrollState).find(side =>
      oldEdgeScrollState[side] !== newEdgeScrollState[side]
    );
    if (edgeScrollHasChanged || oldEdgeScrollState === initialEdgeScrollState) {
      this.set('edgeScrollState', newEdgeScrollState);
      this.reloadEdgeScrollClasses();
    }
    if (edgeScrollHasChanged) {
      element.dispatchEvent(new Event('edge-scroll-change'));

      if (typeof onEdgeScroll === 'function') {
        onEdgeScroll(Object.assign({}, newEdgeScrollState));
      }
    }

    if (event && event.type === 'touchmove') {
      if (
        // any scroll starting from the middle of content
        (!oldEdgeScrollState.top && !oldEdgeScrollState.bottom) ||
        // or any scroll, that was on the top and moved down
        oldEdgeScrollState.top !== newEdgeScrollState.top ||
        // or any scroll, that was on the bottom and moved up
        oldEdgeScrollState.bottom !== newEdgeScrollState.bottom
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

  reloadEdgeScrollClasses() {
    const {
      edgeScrollState,
      element,
    } = this.getProperties('edgeScrollState', 'element');

    // Cannot change classes via `classNameBindings`, because it would override
    // perfect-scrollbar dynamic classes.
    Object.keys(edgeScrollState).forEach(side =>
      element.classList.toggle(`on-${side}`, edgeScrollState[side])
    );
  },

  actions: {
    scrollTop() {
      return this.$().scrollTop(...arguments);
    },
  },
});
