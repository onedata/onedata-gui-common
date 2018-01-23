/**
 * Mixin for element overflow detection. It checks, if there is enough 
 * place for a given element. Overflow status is available via hasOverflow field. 
 * It works using algorithm (pseudo-code):
 * 
 * ```
 * if (window.width < minimumFullWindowSize) hasOverflow = true
 * else hasOverflow = overflowParentElement.width < 
 *    overflowElement.width + overflowSiblingsElements.widthSum + additionalOverflowMargin
 * ```
 * 
 * @module mixins/content-overflow-detector
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  run,
} = Ember;

export default Ember.Mixin.create({
  /**
   * Element, whose overflow is being checked
   * To inject.
   * @type {JQuery}
   */
  overflowElement: null,

  /**
   * Container element, whose width is taken as an available place for the 
   * checked element. Default is overflowElement.parent()
   * @type {JQuery}
   */
  overflowParentElement: null,

  /**
   * Elements that takes space (width) in container 
   * (parent) and must be taken into account while 
   * calculating space for checked element.
   * Default is overflowElement.siblings()
   * @type {JQuery}
   */
  overflowSiblingsElements: null,

  /**
   * Flag that changes if there is no place for checked element
   * @type: {boolean}
   */
  hasOverflow: false,

  /**
   * Additional margin for checked element. 
   * If element.width + additionalOverflowMargin < available place, then
   * hasOverflow = true
   * @type {number}
   */
  additionalOverflowMargin: 50,

  /**
   * Detection debounce time in ms
   * @type {number}
   */
  overflowDetectionDelay: 50,

  /**
   * For any window width less than this value, hasOverflow will always be true
   * @type {number}
   */
  minimumFullWindowSize: 0,

  _overflowDetectionListener: null,

  /**
   * Window property (mainly for testing purposes)
   * @type {Window}
   */
  _window: window,

  addOverflowDetectionListener() {
    let {
      overflowElement,
      overflowParentElement,
      overflowSiblingsElements,
      overflowDetectionDelay,
      _window
    } = this.getProperties('overflowElement', 'overflowParentElement',
      'overflowSiblingsElements', 'overflowDetectionDelay', '_window');
    if (!overflowParentElement) {
      this.set('overflowParentElement', overflowElement.parent());
    }
    if (!overflowSiblingsElements) {
      this.set('overflowSiblingsElements', overflowElement.siblings());
    }
    let detectOverflowFunction = () => this.detectOverflow();
    let overflowDetectionListener = () => {
      run.debounce(overflowElement, detectOverflowFunction, overflowDetectionDelay);
    };
    this.set('_overflowDetectionListener', overflowDetectionListener);
    _window.addEventListener('resize', overflowDetectionListener);
    this.detectOverflow();
  },

  removeOverflowDetectionListener() {
    this.get('_window').removeEventListener('resize', this.get(
      '_overflowDetectionListener'));
  },

  detectOverflow() {
    if (this.isDestroyed) {
      return;
    }

    let {
      overflowElement,
      overflowParentElement,
      overflowSiblingsElements,
      additionalOverflowMargin,
      minimumFullWindowSize,
      _window
    } = this.getProperties(
      'overflowElement',
      'overflowParentElement',
      'overflowSiblingsElements',
      'additionalOverflowMargin',
      'minimumFullWindowSize',
      '_window'
    );

    if (minimumFullWindowSize && _window.innerWidth < minimumFullWindowSize) {
      this.set('hasOverflow', true);
      return;
    }

    let elementWidth = overflowElement.outerWidth(true);
    if (overflowElement.is(':hidden')) {
      let previousCss = overflowElement.attr('style');
      let newCss = previousCss +
        ';position: absolute !important; visibility: hidden !important; display: block !important;';
      // shows element using standard display:block (but it is hidden from user)
      // after that we can measure its width as if it was visible and
      // then we fallback to previous styles
      overflowElement.attr('style', newCss);
      elementWidth = overflowElement.outerWidth(true);
      overflowElement.attr('style', previousCss ? previousCss : '');
    }
    let parentWidth = overflowParentElement.width();
    let siblingsWidth = overflowSiblingsElements.get().map(sibling => $(sibling).outerWidth(
        true))
      .reduce((prev, curr) => prev + curr, 0);
    this.set('hasOverflow',
      parentWidth - siblingsWidth < elementWidth + additionalOverflowMargin);
  }
});
