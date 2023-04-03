/**
 * Performs automatic scrolling to an (Y axis) edge when cursor is near that
 * edge. Speed of scrolling depends on how close your mouse is to the edge.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import dom from 'onedata-gui-common/utils/dom';

export default class EdgeScroller {
  /**
   * @public
   * @param {HTMLElement} element
   * @param {number} maxVelocity
   */
  constructor(element, maxVelocity = 1500) {
    /**
     * @private
     * @type {HTMLElement}
     */
    this.element = element;

    /**
     * @private
     * @type {number}
     */
    this.maxVelocity = maxVelocity;

    /**
     * @private
     * @type {boolean}
     */
    this.isEnabled = false;

    /**
     * @private
     * @type {number}
     */
    this.velocity = 0;

    /**
     * @private
     * @type {(event: MouseEvent) => void}
     */
    this.mouseMoveHandler = this.handleMouseMove.bind(this);

    /**
     * @private
     * @type {number}
     */
    this.lastScrollTimestampMillis = 0;

    this.element.addEventListener('mousemove', this.mouseMoveHandler);
    this.element.addEventListener('dragover', this.mouseMoveHandler);
  }

  /**
   * @public
   * @returns {void}
   */
  destroy() {
    if (this.isEnabled) {
      this.disable();
    }

    this.element.removeEventListener('mousemove', this.mouseMoveHandler);
    this.element.removeEventListener('dragover', this.mouseMoveHandler);
  }

  /**
   * @public
   * @returns {void}
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * @public
   * @returns {void}
   */
  disable() {
    this.changeVelocity(0);
    this.isEnabled = false;
  }

  /**
   * @private
   * @param {number} newVelocity
   * @returns {void}
   */
  changeVelocity(newVelocity) {
    if (!this.isEnabled) {
      return;
    }

    const oldVelocity = this.velocity;
    this.velocity = newVelocity;

    if (oldVelocity === 0 && newVelocity !== 0) {
      this.startScrolling();
    }
  }

  /**
   * @private
   * @returns {void}
   */
  startScrolling() {
    this.lastScrollTimestampMillis = Date.now();
    this.scheduleNextScrollFrame();
  }

  /**
   * @private
   * @param {MouseEvent} event
   * @returns {void}
   */
  handleMouseMove(event) {
    if (!this.isEnabled) {
      return;
    }

    if (event.pageX === 0 && event.pageY === 0) {
      this.changeVelocity(0);
      return;
    }

    const scrollableAreaHeight = dom.height(this.element, dom.LayoutBox.PaddingBox);
    const triggeringAreaHeight = Math.min(scrollableAreaHeight / 3, 50);
    const pointerYInScrollableArea =
      Math.max(event.pageY - dom.offset(this.element).top, 0);

    if (triggeringAreaHeight < 1) {
      this.changeVelocity(0);
      return;
    }

    let velocityFraction = 0;
    let velocitySign = 1;
    if (pointerYInScrollableArea < triggeringAreaHeight) {
      velocityFraction = 1 - (pointerYInScrollableArea / triggeringAreaHeight);
      velocitySign = -1;
    } else if (pointerYInScrollableArea > scrollableAreaHeight - triggeringAreaHeight) {
      velocityFraction = (
        pointerYInScrollableArea - (scrollableAreaHeight - triggeringAreaHeight)
      ) / triggeringAreaHeight;
    }

    const velocity = Math.floor(this.maxVelocity * velocityFraction) * velocitySign;
    this.changeVelocity(velocity);
  }

  /**
   * @private
   * @returns {void}
   */
  scheduleNextScrollFrame() {
    requestAnimationFrame(() => {
      if (this.velocity === 0) {
        return;
      }

      const totalPxToScroll = this.getTotalPxToScroll(this.velocity < 0 ? 'up' : 'down');
      if (totalPxToScroll < 1) {
        this.changeVelocity(0);
        return;
      }

      const millisSincePrevScroll = Date.now() - this.lastScrollTimestampMillis;
      const pxToScrollNow = (this.velocity / 1000) * millisSincePrevScroll;
      if (Math.abs(pxToScrollNow) > 1) {
        this.element.scrollBy({ top: pxToScrollNow });
        this.lastScrollTimestampMillis = Date.now();
      }

      this.scheduleNextScrollFrame();
    });
  }

  /**
   * @private
   * @param {'up'|'down'} direction
   * @returns {number}
   */
  getTotalPxToScroll(direction) {
    const scrollableAreaHeight = dom.height(this.element, dom.LayoutBox.PaddingBox);
    const scrollableContentHeight = this.element.scrollHeight;
    const scrollTopPosition = this.element.scrollTop;

    if (direction === 'up') {
      return scrollTopPosition;
    } else {
      return Math.max(
        scrollableContentHeight - (scrollTopPosition + scrollableAreaHeight),
        0,
      );
    }
  }
}
