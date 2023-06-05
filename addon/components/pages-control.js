/**
 * A page switcher. It is recommended to use it with `array-pager` util.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/pages-control';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['pages-control'],
  classNameBindings: ['hasPageNumberInput::without-page-number-input'],

  /**
   * @override
   */
  i18nPrefix: 'components.pagesControl',

  /**
   * @virtual
   * @type {number}
   */
  activePageNumber: undefined,

  /**
   * @virtual
   * @type {number}
   */
  pageSize: undefined,

  /**
   * @virtual
   * @type {number}
   */
  pagesCount: undefined,

  /**
   * @virtual
   * @type {(pageNumber: number) => void}
   */
  onPageChange: undefined,

  /**
   * @type {number}
   */
  hasPageNumberInput: true,

  changePage(newPageNumber) {
    if (!this.isPageOutOfRange(newPageNumber)) {
      this.onPageChange(newPageNumber);
    }
  },

  isPageOutOfRange(page) {
    return page < 1 || page > this.pagesCount;
  },

  disabledButtons: computed(
    'pagesCount',
    'activePageNumber',
    function disabledButtons() {
      const isFirst = this.activePageNumber <= 1;
      const isLast = this.activePageNumber >= this.pagesCount;
      return {
        first: isFirst,
        prev: isFirst,
        next: isLast,
        last: isLast,
      };
    }
  ),

  actions: {
    firstPage() {
      this.changePage(1);
    },
    lastPage() {
      this.changePage(this.pagesCount);
    },
    nextPage() {
      this.changePage(this.activePageNumber + 1);
    },
    prevPage() {
      this.changePage(this.activePageNumber - 1);
    },
    changePage(numberString) {
      try {
        const newPageNumber = parseInt(numberString);
        if (!Number.isNaN(newPageNumber)) {
          this.changePage(newPageNumber);
        }
      } catch {
        // ignore wrong numbers
      }
    },
  },
});
