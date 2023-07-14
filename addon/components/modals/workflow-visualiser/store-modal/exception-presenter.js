/**
 * Shows exception store content.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, set } from '@ember/object';
import layout from 'onedata-gui-common/templates/components/modals/workflow-visualiser/store-modal/exception-presenter';
import ListPresenter from './list-presenter';

export default ListPresenter.extend({
  layout,
  classNames: ['exception-presenter'],

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.exceptionPresenter',

  /**
   * @type {Object<string, string>}
   */
  itemIndexToTraceIdMap: undefined,

  /**
   * @override
   */
  fetchEntriesCallback: computed(
    'getStoreContentCallback',
    function fetchEntriesCallback() {
      return async (listingParams) => {
        const results = await this.getStoreContentCallback({
          type: 'exceptionStoreContentBrowseOptions',
          ...listingParams,
        });
        const unpackedItems = [];
        results.items.forEach(({ value: { traceId, value }, index, ...rest }) => {
          unpackedItems.push({
            ...rest,
            index,
            value,
          });
          set(this.itemIndexToTraceIdMap, index, traceId);
        });

        this.updateColumnsIfNeeded(unpackedItems);

        return {
          entries: unpackedItems,
          isLast: results.isLast,
        };
      };
    }
  ),

  init() {
    this._super(...arguments);
    this.set('itemIndexToTraceIdMap', {});
  },
});
