/**
 * Extended version of ember-bootstrap tooltip. Adds positioning of tooltip 
 * arrow by setting `arrowPlacement` and `arrowOffset` property.
 * 
 * Typical usage: 
 * ```
 * {{one-tooltip title="tooltip text" placement="top" arrowPlacement="right"}}
 * ```
 * 
 * @module components/one-tooltip
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsTooltip from 'ember-bootstrap/components/bs-tooltip';
import { inject } from '@ember/service';
import { observer } from '@ember/object';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default BsTooltip.extend({
  scrollState: inject(),

  /**
   * Arrow position.
   * @type {string}
   * 
   * For top and bottom tooltip placement valid values are: left, right, center
   * For left and right tooltip placement valid values are: top, bottom, center
   */
  arrowPlacement: 'center',

  /**
   * Arrow offset (in px) from the edge specified by `arrowPosition` property.
   * @type {number}
   */
  arrowOffset: 20,

  /**
   * Hides tooltip on page scroll
   */
  _scrollStateObserver: observer('scrollState.lastScrollEvent', function () {
    if (this.get('inDom')) {
      this.hide();
    }
  }),

  init() {
    this._super(...arguments);
    this.get('scrollState');
  },

  /**
   * Bugfix: surrounds `_show` method with `safeExec` to avoid
   * "set on destoryed object" error.
   * @override
   */
  _show() {
    const args = arguments;
    safeExec(this, () => this._super(...args));
  },

  /**
   * Adds to bs-tooltip arrow implementation translateX/Y property to place it 
   * again over the target after tooltip offset manipulation.
   * 
   * @param {number} delta 
   * @param {string} dimension 
   * @param {boolean} isVertical 
   */
  replaceArrow(delta, dimension, isVertical) {
    this._super(delta, dimension, isVertical);

    let {
      arrowElement,
      arrowPlacement,
    } = this.getProperties(
      'arrowElement',
      'arrowPlacement'
    );
    arrowElement = $(arrowElement);

    let offset = this._getArrowRelativeOffset();
    switch (arrowPlacement) {
      case 'left':
        offset += delta / 2;
        /* falls through */
      case 'right':
        arrowElement.css('transform', `translateX(${offset}px)`);
        break;
      case 'top':
      case 'bottom':
        arrowElement.css('transform', `translateY(${offset}px)`);
        break;
    }
  },

  /**
   * Adds to bs-tooltip implementation a fake placement offset to change 
   * tooltip position.
   * 
   * @param {Object} offset 
   * @param {string} placement 
   */
  applyPlacement(offset, placement) {
    let arrowPlacement = this.get('arrowPlacement');
    let arrowOffset = -this._getArrowRelativeOffset();
    switch (arrowPlacement) {
      case 'left':
      case 'right':
        offset.left += arrowOffset;
        break;
      case 'top':
      case 'bottom':
        offset.top += arrowOffset;
        break;
    }

    this._super(offset, placement);
  },

  _getArrowRelativeOffset() {
    let {
      overlayElement,
      arrowPlacement,
      arrowOffset,
    } = this.getProperties(
      'overlayElement',
      'arrowPlacement',
      'arrowOffset'
    );
    overlayElement = $(overlayElement);
    let offset;
    if (arrowPlacement === 'left' || arrowPlacement === 'right') {
      offset = overlayElement.width() / 2 - arrowOffset;
    } else {
      offset = overlayElement.height() / 2 - arrowOffset;
    }
    if (arrowPlacement === 'left' || arrowPlacement === 'top') {
      offset *= -1;
    }
    return offset;
  }
});
