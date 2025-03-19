/**
 * Provides desired height of first row of infinite scroll list, which is a blank
 * placeholder replacing a number of not visible entries on list head.
 *
 * To provide custom way of computing the height, override `computeHeight` method.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {number}
   */
  singleRowHeight: 0,

  /**
   * @virtual
   * @type {ReplacingChunksArray}
   */
  entries: undefined,

  /**
   * @type {'height'|'min-height'}
   */
  styleHeightProperty: 'height',

  /**
   * @type {ComputedProperty<number>}
   */
  height: computed(
    'singleRowHeight',
    'entries._start',
    function height() {
      return this.computeHeight(this.entries, this.computeItemsHeight.bind(this));
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  style: computed('height', 'styleHeightProperty', function style() {
    return htmlSafe(`${this.styleHeightProperty}: ${this.height}px;`);
  }),

  /**
   * A method that can be overriden to provide advanced way to compute height of first
   * row. For example, when we know, that some item has other height than others.
   * @param {ReplacingChunksArray} [entries]
   * @param {() => number} [defaultComputeFun] Invoke this function to get standard height
   *   of first row (based on constant items height).
   * @returns {number}
   */
  computeHeight( /* entries, defaultComputeFun */ ) {
    return this.computeItemsHeight();
  },

  /**
   * The simplest method to computed needed virtual first row height when all items have
   * the same and known height.
   * @private
   * @returns {number}
   */
  computeItemsHeight() {
    const _start = this.entries?._start ?? 0;
    return _start * this.singleRowHeight;
  },
});
