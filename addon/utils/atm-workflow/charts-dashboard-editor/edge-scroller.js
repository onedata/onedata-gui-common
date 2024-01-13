/**
 * Performs automatic scrolling to an element edge when cursor is near that
 * edge. Speed of scrolling depends on how close your mouse is to the edge.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import dom from 'onedata-gui-common/utils/dom';

/**
 * @typedef {Object} EdgeScrollerOptions
 * @property {number} [maxVelocity]
 * @property {number} [frameDuration]
 */

/**
 * @typedef {Object} EdgeScrollerScrollEventMovement
 * @property {'top' | 'bottom' | 'left' | 'right'} targetDirection
 * @property {number} availableDistance
 * @property {number} wantedDistance
 * @property {number} scrolledDistance
 */

/**
 * @typedef {Object} EdgeScrollerScrollEvent
 * @property {Array<EdgeScrollerScrollEventMovement>} scrollMovements
 */

/**
 * @typedef {(event: EdgeScrollerScrollEvent) => void)} EdgeScrollerScrollEventListener
 */

export default class EdgeScroller {
  /**
   * @public
   * @param {HTMLElement} element
   * @param {EdgeScrollerOptions} options
   */
  constructor(element, { maxVelocity = 1500, frameDuration = 20 } = {}) {
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
     * @type {number}
     */
    this.frameDuration = frameDuration;

    /**
     * @private
     * @type {boolean}
     */
    this.isEnabled = false;

    /**
     * @private
     * @type {{ x: number, y: number }}
     */
    this.velocity = { x: 0, y: 0 };

    /**
     * @private
     * @type {(event: MouseEvent) => void}
     */
    this.mouseMoveHandler = this.handleMouseMove.bind(this);

    /**
     * @private
     * @type {{ x: number, y: number }}
     */
    this.lastScrollTimestampMillis = { x: 0, y: 0 };

    /**
     * @private
     * @type {Set<EdgeScrollerScrollEventListener>}
     */
    this.scrollListeners = new Set();

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
    this.scrollListeners.clear();
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
    this.changeVelocity({ x: 0, y: 0 });
    this.isEnabled = false;
  }

  /**
   * @public
   * @param {EdgeScrollerScrollEventListener} listener
   * @returns {void}
   */
  addScrollEventListener(listener) {
    this.scrollListeners.add(listener);
  }

  /**
   * @public
   * @param {EdgeScrollerScrollEventListener} listener
   * @returns {void}
   */
  removeScrollEventListener(listener) {
    this.scrollListeners.delete(listener);
  }

  /**
   * @private
   * @param {EdgeScrollerScrollEvent} event
   * @returns {void}
   */
  emitScrollEvent(event) {
    this.scrollListeners.forEach((listener) => listener(event));
  }

  /**
   * @private
   * @param {{ x: number, y: number }} newVelocity
   * @returns {void}
   */
  changeVelocity(newVelocity) {
    if (!this.isEnabled) {
      return;
    }

    const oldVelocity = this.velocity;
    this.velocity = newVelocity;

    if (
      oldVelocity.x === 0 &&
      oldVelocity.y === 0 &&
      (newVelocity.x !== 0 || newVelocity.y !== 0)
    ) {
      this.startScrolling();
    }
  }

  /**
   * @private
   * @returns {void}
   */
  startScrolling() {
    this.lastScrollTimestampMillis = { x: Date.now(), y: Date.now() };
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

    // Filtering out events with incorrect mouse coordinates. These may
    // sometimes happen when the mouse pointer exits the browser window.
    if (event.pageX === 0 && event.pageY === 0) {
      this.changeVelocity({ x: 0, y: 0 });
      return;
    }

    const newVelocity = { x: 0, y: 0 };
    ['x', 'y'].forEach((axis) => {
      const scrollableAreaSize = (axis === 'x' ? dom.width : dom.height)(
        this.element,
        dom.LayoutBox.PaddingBox
      );
      const triggeringAreaSize = Math.max(Math.min(scrollableAreaSize / 3, 50), 1);
      const pointerPositionInScrollableArea =
        Math.max(
          event[axis === 'x' ? 'pageX' : 'pageY'] -
          dom.offset(this.element)[axis === 'x' ? 'left' : 'top'],
          0
        );

      let axisVelocityFraction = 0;
      let axisVelocitySign = 1;
      if (pointerPositionInScrollableArea < triggeringAreaSize) {
        axisVelocityFraction = 1 - (pointerPositionInScrollableArea / triggeringAreaSize);
        axisVelocitySign = -1;
      } else if (
        pointerPositionInScrollableArea > scrollableAreaSize - triggeringAreaSize
      ) {
        axisVelocityFraction = (
          pointerPositionInScrollableArea - (scrollableAreaSize - triggeringAreaSize)
        ) / triggeringAreaSize;
      }
      newVelocity[axis] = Math.floor(this.maxVelocity * axisVelocityFraction) *
        axisVelocitySign;
    });

    this.changeVelocity(newVelocity);
  }

  /**
   * @private
   * @returns {void}
   */
  scheduleNextScrollFrame() {
    requestAnimationFrame(() => {
      if (this.velocity.x === 0 && this.velocity.y === 0) {
        return;
      }

      const scrollBy = {};
      const scrollMovements = [];
      ['x', 'y'].forEach((axis) => {
        if (this.velocity[axis] === 0) {
          return;
        }

        const millisSincePrevScroll = Date.now() - this.lastScrollTimestampMillis[axis];
        const totalPxToScroll = this.getTotalPxToScroll(
          axis,
          this.velocity[axis] < 0 ? 'toStart' : 'toEnd'
        );
        const pxToScrollNow = (this.velocity[axis] / 1000) * millisSincePrevScroll;
        const targetDirection = this.normalizeAxisDirectionToTargetDirection(
          axis,
          this.velocity[axis] < 0 ? 'toStart' : 'toEnd'
        );
        if (totalPxToScroll >= 1) {
          if (Math.abs(pxToScrollNow) > 1) {
            scrollBy[axis === 'x' ? 'left' : 'top'] = pxToScrollNow;
            this.lastScrollTimestampMillis[axis] = Date.now();
            scrollMovements.push({
              targetDirection,
              availableDistance: totalPxToScroll,
              wantedDistance: Math.abs(pxToScrollNow),
              scrolledDistance: Math.min(Math.abs(pxToScrollNow), totalPxToScroll),
            });
          }
        } else {
          // Scrolling is impossible as we reached the end of element. From now
          // we behave like each scroll frame works, but just scrolls by 0 pixels.
          this.lastScrollTimestampMillis[axis] = Date.now();
          scrollMovements.push({
            targetDirection,
            availableDistance: totalPxToScroll,
            wantedDistance: Math.abs(pxToScrollNow),
            scrolledDistance: 0,
          });
        }
      });

      if (Object.keys(scrollBy).length > 0) {
        this.element.scrollBy(scrollBy);
      }
      if (scrollMovements.length) {
        this.emitScrollEvent({ scrollMovements });
      }

      setTimeout(() => this.scheduleNextScrollFrame(), this.frameDuration);
    });
  }

  /**
   * @private
   * @param {'x' | 'y'} axis
   * @param {'toStart' | 'toEnd'} axisDirection
   * @returns {number}
   */
  getTotalPxToScroll(axis, axisDirection) {
    const checkXAxis = axis === 'x';

    const scrollableAreaSize = (checkXAxis ? dom.width : dom.height)(
      this.element,
      dom.LayoutBox.PaddingBox
    );
    const scrollableContentSize = checkXAxis ?
      this.element.scrollWidth : this.element.scrollHeight;
    const scrollPosition = checkXAxis ?
      this.element.scrollLeft : this.element.scrollTop;

    if (axisDirection === 'toStart') {
      return scrollPosition;
    } else {
      return Math.max(
        scrollableContentSize - (scrollPosition + scrollableAreaSize),
        0,
      );
    }
  }

  /**
   * @private
   * @param {'x' | 'y'} axis
   * @param {'toStart' | 'toEnd'} axisDirection
   * @returns {'top' | 'bottom' | 'left' | 'right'}
   */
  normalizeAxisDirectionToTargetDirection(axis, axisDirection) {
    if (axis === 'x') {
      return axisDirection === 'toStart' ? 'left' : 'right';
    } else {
      return axisDirection === 'toStart' ? 'top' : 'bottom';
    }
  }
}
