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
   * @type {(browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>}
   */
  getStoreContentCallback: undefined,

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
  tableColumnsCount: computed('itemDataSpec', function tableColumnsCount() {
    return getTableValuePresenterColumnsCount(this.itemDataSpec);
  }),

  /**
   * @type {ComputedProperty<(entry: AtmUnavailableValueContainer<unknown>) => string>}
   */
  createErrorMessage: computed(function createErrorMessage() {
    return (entry) => {
      const errorDescription = this.errorExtractor.getMessage(entry.error);
      return `${this.t('storeAccessError')}: ${errorDescription.message || this.t('unknownError')}`;
    };
  }),
});
