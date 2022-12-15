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
 * @copyright (C) 2017-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BsTooltip from 'ember-bootstrap/components/bs-tooltip';
import { inject } from '@ember/service';
import { observer } from '@ember/object';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import config from 'ember-get-config';
import dom from 'onedata-gui-common/utils/dom';

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
   * If true, the global scrollState will be observed and tooltip will be hidden
   * when user scrolls.
   * @type {boolean}
   */
  hideOnScroll: true,

  /**
   * Hides tooltip on page scroll
   */
  _scrollStateObserver: observer('scrollState.lastScrollEvent', function () {
    const {
      hideOnScroll,
      inDom,
    } = this.getProperties('hideOnScroll', 'inDom');
    if (hideOnScroll && inDom) {
      this.hide();
    }
  }),

  init() {
    this._super(...arguments);
    this.get('scrollState');

    if (config.environment === 'test') {
      this.setProperties({
        fade: false,
        delay: 0,
      });
    }
  },

  /**
   * @override
   */
  _show() {
    const args = arguments;

    // Bugfix: surround `_show` method with `safeExec` to avoid
    // "set on destroyed object" error.
    return safeExec(this, () => {
      // Bugfix: fast changing `visible` property not closes tooltip.
      //
      // Bug description: when changing a tooltip visibility manually via `visible`
      // property, there were cases when tooltip stayed open even when `visible` was
      // false. It was caused by `_watchVisible` observer calling `show()` which
      // then schedules running `_show()`. That scheduling runs `_show()` asynchronously
      // and it was possible to change `visible` value to `false` between scheduling
      // and running `_show()`. `_show()` does not have any checks regarding
      // current value of `visible` hence it opens tooltip regardless `visible === false`.
      //
      // Additional `!hoverState` is needed to be sure, that showing tooltip
      // was triggered manually (via `visible` change) and not by an event.
      // When showing tooltip via event (mouse hover etc.) `visible` property
      // can be `false` and that's correct.
      const {
        visible,
        hoverState,
      } = this.getProperties('visible', 'hoverState');

      if (!visible && !hoverState) {
        // Only `return` is not enough here - it leaves rendered (but transparent)
        // tooltip, which overlays page content.
        this.hide();
        return;
      }
      // End of the "fast changing `visible` property not closes tooltip" bugfix

      this._super(...args);
    });
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

    const {
      arrowElement,
      arrowPlacement,
    } = this.getProperties(
      'arrowElement',
      'arrowPlacement'
    );

    if (!arrowElement) {
      return;
    }

    let offset = this._getArrowRelativeOffset();
    switch (arrowPlacement) {
      case 'left':
        offset += delta / 2;
        /* falls through */
      case 'right':
        dom.setStyle(arrowElement, 'transform', `translateX(${offset}px)`);
        break;
      case 'top':
      case 'bottom':
        dom.setStyle(arrowElement, 'transform', `translateY(${offset}px)`);
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
    const arrowPlacement = this.get('arrowPlacement');
    const arrowOffset = -this._getArrowRelativeOffset();
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
  },
});
