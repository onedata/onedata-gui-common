/**
 * Basing on an array, creates array pages (slices) for given page number.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Array}
   */
  array: undefined,

  /**
   * @virtual
   * @type {number}
   */
  pageSize: undefined,

  /**
   * @virtual
   * @type {number}
   */
  activePageNumber: 1,

  /**
   * @type {ComputedProperty<number>}
   */
  pagesCount: computed('array.length', function pagesCount() {
    return Math.floor(this.array.length / this.pageSize) +
      ((this.array.length % this.pageSize) ? 1 : 0);
  }),

  activePageArray: computed(
    'array.[]',
    'activePageNumber',
    'pageSize',
    'pagesCount',
    function activePageNumber() {
      if (this.isPageOutOfRange(this.activePageNumber)) {
        return [];
      }
      const startIndex = (this.activePageNumber - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.array.slice(startIndex, endIndex);
    }
  ),

  /**
   * @public
   * @param {number} newPageNumber
   * @returns void
   */
  changeActivePageNumber(newPageNumber) {
    if (this.isPageOutOfRange(newPageNumber)) {
      return;
    }
    this.set('activePageNumber', newPageNumber);
  },

  isPageOutOfRange(page) {
    return page < 1 || page > this.pagesCount;
  },
});
