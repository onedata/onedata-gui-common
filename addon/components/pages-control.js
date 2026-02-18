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
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  layout,
  classNames: ['pages-control'],
  classNameBindings: [
    'hasPageNumberInput::without-page-number-input',
    'invalidPageNumber:invalid-page-number',
  ],

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
   * @virtual optional
   * @type {string}
   */
  customPerPageText: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isPerPageDropdownVisible: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isFiltered: false,

  /**
   * @virtual optional
   * @type {string}
   */
  customFilteredText: undefined,

  /**
   * @virtual optional
   * @type {number}
   */
  hasPageNumberInput: true,

  /**
   * @type {boolean}
   */
  invalidPageNumber: false,

  filteredText: computed('customFilteredText', function filteredText() {
    if (this.customFilteredText) {
      return this.customFilteredText;
    }
    return this.t('filtered');
  }),

  perPageText: computed('customPerPageText', function perPageText() {
    if (this.customPerPageText) {
      return this.customPerPageText;
    }
    return this.t('perPage');
  }),

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

  changePage(newPageNumber) {
    this.set('invalidPageNumber', false);
    this.onPageChange(newPageNumber);
  },

  isPageOutOfRange(page) {
    return page < 1 || page > this.pagesCount;
  },

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
        const newPageNumber = Number(numberString);
        if (
          !this.isPageOutOfRange(newPageNumber) &&
          Number.isInteger(newPageNumber)
        ) {
          this.changePage(newPageNumber);
        } else {
          this.set('invalidPageNumber', true);
        }
      } catch {
        this.set('invalidPageNumber', true);
      }
    },
    changePerPage(value) {
      this.changePerPage(value);
      this.set('pageSize', value);
      this.changePage(1);
    },
  },
});
