/**
 * Container that allows to scroll horizontally-expandable tabs tab-bar-ul
 * component that holds all tabs. When used with `tab-bar-li` renders something
 * like this:
 * ```
 * < | tab1 | tab2 | tab3 | >
 * ```
 *
 * @module components/one-tab-bar/tab-bar-ul-container
 * @author Jakub Liput
 * @copyright (C) 2019-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/one-tab-bar/tab-bar-ul-container';
import ContentOverFlowdetector from 'onedata-gui-common/mixins/content-overflow-detector';
import { computed, observer } from '@ember/object';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

export default Component.extend(ContentOverFlowdetector, {
  layout,
  classNames: ['tab-bar-ul-container', 'bs-tab-onedata', 'bs-tab-modern'],
  classNameBindings: [
    'hasOverflow:tabs-overflowing',
    'scrollLeftReached:scroll-left-reached',
    'scrollRightReached:scroll-right-reached',
  ],

  /**
   * @virtual optional
   * @type {Function}
   */
  hasOverflowChanged: notImplementedIgnore,

  /**
   * Is set to true, when cannot scroll more to the left.
   * See `innerScrollContentScrolled` method.
   * @type {boolean}
   */
  scrollLeftReached: false,

  /**
   * Is set to true, when cannot scroll more to the right.
   * See `innerScrollContentScrolled` method.
   * @type {boolean}
   */
  scrollRightReached: false,

  /**
   * @override implements ContentOverFlowdetector
   */
  overflowElement: computed('element', function overflowElement() {
    return $(this.get('element').querySelector('.tab-bar-ul'));
  }),

  /**
   * A "long" bar element that contains all tabs.
   * It expands horizontally to contain all tab-bar-li
   * (is not scrollable and not cuts the overflow).
   * This element will be scrolled inside the container.
   * @type {jQuery}
   */
  $innerScrollContent: computed('element', function $innerScrollContent() {
    if (!this.element) {
      return null;
    }
    return $(this.element.querySelector('.container-inner-scroll-content'));
  }),

  /**
   * @param {WheelEvent} wheelEvent
   * Intercept vertical scrolling and scroll content horizontally.
   */
  wheelEventHandler: computed(function wheelEventHandler() {
    return (wheelEvent) => {
      const { deltaX, deltaY } = wheelEvent;
      if (deltaX === 0 && deltaY !== 0) {
        wheelEvent.preventDefault();
        this.scrollContainer(deltaY);
      }
    };
  }),

  didInsertElement() {
    this._super(...arguments);
    const $innerScrollContent = this.get('$innerScrollContent');
    const self = this;
    this.addOverflowDetectionListener();
    this.get('_overflowDetectionListener')();
    $innerScrollContent.scroll(function onScrollContent() {
      return self.innerScrollContentScrolled(this);
    });
    this.innerScrollContentScrolled($innerScrollContent[0]);
    this.element.addEventListener(
      'wheel',
      this.get('wheelEventHandler'), {
        passive: false,
      }
    );
  },

  willDestroyElement() {
    this._super(...arguments);
    this.removeOverflowDetectionListener();
    this.element.removeEventListener('wheel', this.get('wheelEventHandler'));
  },

  /**
   * @override
   */
  onOverflowRecomputed(hasOverflow, isChanged) {
    (async () => {
      await waitForRender();
      if (this.$innerScrollContent) {
        this.innerScrollContentScrolled(this.$innerScrollContent[0]);
      }
    })();
    if (isChanged) {
      this.hasOverflowChanged(hasOverflow);
    }
  },

  /**
   * Method to handle scroll event.
   * Check if scroll reached left or right boundaries.
   * @param {HTMLElement} element
   */
  innerScrollContentScrolled(element) {
    const scrollLeftReached = (element.scrollLeft === 0);
    const scrollRightReached =
      element.scrollLeft + element.clientWidth >= element.scrollWidth;
    safeExec(this, 'setProperties', {
      scrollLeftReached,
      scrollRightReached,
    });
  },

  /**
   * Programatically invoke scrolling of tabs container.
   * @param {number} delta value in pixels to scroll horizontally
   */
  scrollContainer(delta) {
    const $innerScrollContent = this.get('$innerScrollContent');
    $innerScrollContent.scrollLeft($innerScrollContent.scrollLeft() + delta);
  },

  actions: {
    /**
     * Scroll tabs horizontally.
     * @param {string} direction one of: left, right
     * @param {number} moveDelta scroll amount in pixels, used in
     *  `scrollContainer` method
     */
    moveTabs(direction, moveDelta) {
      const right = (direction === 'right');
      this.scrollContainer((right ? 1 : -1) * moveDelta);
    },
  },
});
