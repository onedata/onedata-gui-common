/**
 * Shows list store content.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/list-presenter';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import {
  getTableHeaderRowPresenter,
  getTableBodyRowPresenter,
  getTableValuePresenterColumnsCount,
} from 'onedata-gui-common/utils/atm-workflow/value-presenters';

export default Component.extend(I18n, {
  layout,
  classNames: ['list-presenter'],

  i18n: service(),
  errorExtractor: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.listPresenter',

  /**
   * @virtual
   * @type {Object}
   */
  store: undefined,

  /**
   * @virtual
   * @type {(browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>}
   */
  getStoreContentCallback: undefined,

  /**
   * @virtual optional
   * @type {AtmValuePresenterContext}
   */
  context: undefined,

  /**
   * @type {Array<string>}
   */
  availableColumns: undefined,

  /**
   * @type {Array<string>}
   */
  visibleColumns: undefined,

  /**
   * @type {boolean}
   */
  hasUserChangedColumns: false,

  /**
   * @type {number}
   */
  maxAvailableColumnsCount: 100,

  /**
   * @type {number}
   */
  maxAutoVisibleColumnsCount: 5,

  /**
   * @type {ComputedProperty<(listingParams: InfiniteScrollListingParams) => Promise<InfiniteScrollEntriesPage>>}
   */
  fetchEntriesCallback: computed(
    'getStoreContentCallback',
    function fetchEntriesCallback() {
      return async (listingParams) => {
        const results = await this.getStoreContentCallback({
          type: 'listStoreContentBrowseOptions',
          ...listingParams,
        });

        this.updateColumnsIfNeeded(results.items);

        return {
          entries: results.items,
          isLast: results.isLast,
        };
      };
    }
  ),

  /**
   * @type {ComputedProperty<AtmDataSpec>}
   */
  itemDataSpec: reads('store.config.itemDataSpec'),

  /**
   * @type {ComputedProperty<string>}
   */
  tableHeaderRowPresenterComponent: computed(
    'itemDataSpec',
    function tableHeaderRowPresenterComponent() {
      return getTableHeaderRowPresenter(this.itemDataSpec);
    }
  ),

  /**
   * @type {ComputedProperty<string>}
   */
  tableBodyRowPresenterComponent: computed(
    'itemDataSpec',
    function tableBodyRowPresenterComponent() {
      return getTableBodyRowPresenter(this.itemDataSpec);
    }
  ),

  /**
   * @type {ComputedProperty<number>}
   */
  tableColumnsCount: computed(
    'itemDataSpec',
    'visibleColumns',
    function tableColumnsCount() {
      return getTableValuePresenterColumnsCount(this.itemDataSpec, this.visibleColumns);
    }
  ),

  /**
   * @type {ComputedProperty<(entry: AtmUnavailableValueContainer<unknown>) => string>}
   */
  createErrorMessage: computed(function createErrorMessage() {
    return (entry) => {
      const errorDescription = this.errorExtractor.getMessage(entry.error);
      return `${this.t('storeAccessError')}: ${errorDescription.message || this.t('unknownError')}`;
    };
  }),

  init() {
    this._super(...arguments);

    this.setProperties({
      availableColumns: [],
      visibleColumns: [],
    });
  },

  updateColumnsIfNeeded(newEntries) {
    if (this.itemDataSpec?.type !== 'object' || !newEntries?.length) {
      return;
    }

    this.updateAvailableColumns(newEntries);
    this.updateVisibleColumns();
  },

  updateAvailableColumns(newEntries) {
    if (this.availableColumns.length >= this.maxAvailableColumnsCount) {
      return;
    }

    const availableColumnsSet = new Set(this.availableColumns);

    for (const entry of newEntries) {
      const entryValue = entry?.value;
      if (typeof entryValue !== 'object' || !entryValue || Array.isArray(entryValue)) {
        continue;
      }

      for (const key in entryValue) {
        availableColumnsSet.add(key);
        if (availableColumnsSet.size >= this.maxAvailableColumnsCount) {
          break;
        }
      }
      if (availableColumnsSet.size >= this.maxAvailableColumnsCount) {
        break;
      }
    }

    if (availableColumnsSet.size > this.availableColumns.length) {
      this.set(
        'availableColumns',
        [...availableColumnsSet].sort((a, b) => a.localeCompare(b))
      );
    }
  },

  updateVisibleColumns() {
    if (
      this.hasUserChangedColumns ||
      this.visibleColumns.length >= this.maxAutoVisibleColumnsCount
    ) {
      return;
    }

    const newVisibleColumns = [...this.visibleColumns];
    for (const column of this.availableColumns) {
      if (!newVisibleColumns.includes(column)) {
        newVisibleColumns.push(column);
      }
      if (newVisibleColumns.length >= this.maxAutoVisibleColumnsCount) {
        break;
      }
    }
    if (this.visibleColumns.length !== newVisibleColumns.length) {
      this.set('visibleColumns', newVisibleColumns);
    }
  },

  actions: {
    toggleColumnVisibility(column) {
      let newVisibleColumns;
      if (this.visibleColumns.includes(column)) {
        newVisibleColumns = this.visibleColumns.without(column);
      } else {
        newVisibleColumns = [...this.visibleColumns, column];
      }
      this.setProperties({
        hasUserChangedColumns: true,
        visibleColumns: newVisibleColumns,
      });
    },
  },
});
