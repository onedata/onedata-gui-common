/**
 * Mixin for element overflow detection. It checks, if there is enough
 * place for a given element. Overflow status is available via hasOverflow field.
 * It can detect overflow only in one dimension: width or height.
 * It works using algorithm (pseudo-code) - assuming, that the dimension is width:
 *
 * ```
 * if (window.width < minimumFullWindowSize) hasOverflow = true
 * else hasOverflow = overflowParentElement.width <
 *    overflowElement.width + overflowSiblingsElements.widthSum + additionalOverflowMargin
 * ```
 *
 * @module mixins/content-overflow-detector
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2017-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';

import { run } from '@ember/runloop';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { camelize } from '@ember/string';
import dom from 'onedata-gui-common/utils/dom';

export default Mixin.create({
  /**
   * Invoked every time overflow is recomputed, no matter if it changes.
   * If overflow is changed then `isChanged` is true.
   * @virtual optional
   * @type {(hasOverflow: boolean, isChanged: boolean) => void}
   */
  onOverflowRecomputed: undefined,

  /**
   * @type {'width'|'height'}
   */
  overflowDimension: 'width',

  /**
   * Element, whose overflow is being checked
   * To inject.
   * @type {JQuery}
   */
  overflowElement: null,

  /**
   * Container element, whose size is taken as an available place for the
   * checked element. Default is overflowElement.parent()
   * @type {JQuery}
   */
  overflowParentElement: null,

  /**
   * Elements that takes space (in selected dimension) in container
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
   * If element.width (or height) + additionalOverflowMargin < available place, then
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
   * For any window width (or height) less than this value, hasOverflow will always be
   * true.
   * @type {number}
   */
  minimumFullWindowSize: 0,

  /**
   * @type {boolean}
   */
  isOverflowDetectionAttached: false,

  _overflowDetectionListener: null,

  /**
   * Window property (mainly for testing purposes)
   * @type {Window}
   */
  _window: window,

  addOverflowDetectionListener() {
    if (!this.get('isOverflowDetectionAttached')) {
      const {
        overflowElement,
        overflowParentElement,
        overflowSiblingsElements,
        overflowDetectionDelay,
        _window,
      } = this.getProperties(
        'overflowElement',
        'overflowParentElement',
        'overflowSiblingsElements',
        'overflowDetectionDelay',
        '_window'
      );

      if (!overflowParentElement) {
        this.set('overflowParentElement', $(overflowElement[0].parentElement));
      }
      if (!overflowSiblingsElements) {
        this.set('overflowSiblingsElements', overflowElement.siblings());
      }
      const detectOverflowFunction = () => safeExec(this, 'detectOverflow');
      const overflowDetectionListener = () => {
        run.debounce(overflowElement, detectOverflowFunction, overflowDetectionDelay);
      };
      this.setProperties({
        _overflowDetectionListener: overflowDetectionListener,
        isOverflowDetectionAttached: true,
      });
      _window.addEventListener('resize', overflowDetectionListener);
      this.detectOverflow();
    }
  },

  removeOverflowDetectionListener() {
    if (this.get('isOverflowDetectionAttached')) {
      const {
        _window,
        _overflowDetectionListener,
      } = this.getProperties('_window', '_overflowDetectionListener');
      _window.removeEventListener('resize', _overflowDetectionListener);
      this.set('isOverflowDetectionAttached', false);
    }
  },

  detectOverflow() {
    if (this.isDestroyed) {
      return;
    }

    const {
      overflowElement,
      overflowParentElement,
      overflowSiblingsElements,
      additionalOverflowMargin,
      minimumFullWindowSize,
      _window,
    } = this.getProperties(
      'overflowElement',
      'overflowParentElement',
      'overflowSiblingsElements',
      'additionalOverflowMargin',
      'minimumFullWindowSize',
      '_window'
    );

    const sizeProperty = this.overflowDimension;
    const innerSizeProperty = camelize(`inner-${sizeProperty}`);
    const outerSizeProperty = camelize(`outer-${sizeProperty}`);

    if (minimumFullWindowSize && _window[innerSizeProperty] < minimumFullWindowSize) {
      this.changeHasOverflow(true);
      return;
    }

    let elementSize = overflowElement[outerSizeProperty](true);
    if (dom.isHidden(overflowElement[0])) {
      const previousCss = overflowElement.attr('style');
      const newCss = previousCss +
        ';position: absolute !important; visibility: hidden !important; display: block !important;';
      // shows element using standard display:block (but it is hidden from user)
      // after that we can measure its size as if it was visible and
      // then we fallback to previous styles
      overflowElement.attr('style', newCss);
      elementSize = overflowElement[outerSizeProperty](true);
      overflowElement.attr('style', previousCss ? previousCss : '');
    }
    const parentSize = overflowParentElement[sizeProperty]();
    const siblingsSize = overflowSiblingsElements
      .get()
      .map(sibling => $(sibling)[outerSizeProperty](true))
      .reduce((prev, curr) => prev + curr, 0);
    const newHasOverflow =
      parentSize - siblingsSize < elementSize + additionalOverflowMargin;
    this.changeHasOverflow(newHasOverflow);
  },

  /**
   * @param {boolean} newHasOverflow
   * @return {void}
   */
  changeHasOverflow(newHasOverflow) {
    const isChanged = this.hasOverflow !== newHasOverflow;
    if (isChanged) {
      this.set('hasOverflow', newHasOverflow);
    }
    this.onOverflowRecomputed?.(newHasOverflow, isChanged);
  },
});
