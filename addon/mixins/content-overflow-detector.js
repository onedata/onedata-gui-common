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
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { camelize } from '@ember/string';
import dom from 'onedata-gui-common/utils/dom';
import globals from 'onedata-gui-common/utils/globals';

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
   * @type {HTMLElement}
   */
  overflowElement: null,

  /**
   * Container element, whose size is taken as an available place for the
   * checked element. Default is overflowElement.parentElement
   * @type {HTMLElement}
   */
  overflowParentElement: null,

  /**
   * Elements that takes space (in selected dimension) in container
   * (parent) and must be taken into account while
   * calculating space for checked element.
   * Default is overflowElement sibling elements.
   * @type {Array<HTMLElement>}
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

  addOverflowDetectionListener() {
    if (!this.get('isOverflowDetectionAttached')) {
      const {
        overflowElement,
        overflowParentElement,
        overflowSiblingsElements,
        overflowDetectionDelay,
      } = this.getProperties(
        'overflowElement',
        'overflowParentElement',
        'overflowSiblingsElements',
        'overflowDetectionDelay',
      );

      if (!overflowParentElement) {
        this.set('overflowParentElement', overflowElement.parentElement);
      }
      if (!overflowSiblingsElements) {
        this.set('overflowSiblingsElements', dom.siblings(overflowElement));
      }
      const detectOverflowFunction = () => safeExec(this, 'detectOverflow');
      const overflowDetectionListener = () => {
        run.debounce(overflowElement, detectOverflowFunction, overflowDetectionDelay);
      };
      this.setProperties({
        _overflowDetectionListener: overflowDetectionListener,
        isOverflowDetectionAttached: true,
      });
      globals.window.addEventListener('resize', overflowDetectionListener);
      this.detectOverflow();
    }
  },

  removeOverflowDetectionListener() {
    if (this.get('isOverflowDetectionAttached')) {
      globals.window.removeEventListener('resize', this._overflowDetectionListener);
      this.set('isOverflowDetectionAttached', false);
    }
  },

  detectOverflow() {
    if (this.isDestroyed || !this.overflowElement) {
      return;
    }

    const {
      overflowElement,
      overflowParentElement,
      overflowSiblingsElements,
      additionalOverflowMargin,
      minimumFullWindowSize,
    } = this.getProperties(
      'overflowElement',
      'overflowParentElement',
      'overflowSiblingsElements',
      'additionalOverflowMargin',
      'minimumFullWindowSize',
    );

    const sizeProperty = this.overflowDimension;
    const innerSizeProperty = camelize(`inner-${sizeProperty}`);
    const sizeFunction = dom[sizeProperty];

    if (
      minimumFullWindowSize &&
      globals.window[innerSizeProperty] < minimumFullWindowSize
    ) {
      this.changeHasOverflow(true);
      return;
    }

    let elementSize = sizeFunction(overflowElement, dom.LayoutBox.MarginBox);
    if (dom.isHidden(overflowElement)) {
      const previousCss = overflowElement.getAttribute('style');
      const newCss = previousCss +
        ';position: absolute !important; visibility: hidden !important; display: block !important;';
      // shows element using standard display:block (but it is hidden from user)
      // after that we can measure its size as if it was visible and
      // then we fallback to previous styles
      overflowElement.setAttribute('style', newCss);
      elementSize = sizeFunction(overflowElement, dom.LayoutBox.MarginBox);
      overflowElement.setAttribute('style', previousCss ? previousCss : '');
    }
    const parentSize = sizeFunction(overflowParentElement, dom.LayoutBox.ContentBox);
    const siblingsSize = overflowSiblingsElements
      .map(sibling => sizeFunction(sibling, dom.LayoutBox.MarginBox))
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
