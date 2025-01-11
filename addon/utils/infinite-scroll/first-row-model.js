/**
 * Provides desired height of first row of infinite scroll list, which is a blank
 * placeholder replacing a number of not visible entries on list head.
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
   * @type {ComputedProperty<number>}
   */
  height: computed(
    'singleRowHeight',
    'entries._start',
    function height() {
      // FIXME: prototyp - api nie musi wyglądać wcale tak
      return this.computeHeight(this.entries, this.computeItemsHeight.bind(this));
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  style: computed('height', function style() {
    return htmlSafe(`height: ${this.get('height')}px;`);
  }),

  computeHeight() {
    return this.computeItemsHeight();
  },

  computeItemsHeight() {
    const _start = this.entries?._start ?? 0;
    return _start * this.singleRowHeight;
  },
});
