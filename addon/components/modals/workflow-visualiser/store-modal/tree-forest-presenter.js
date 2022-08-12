/**
 * Shows tree forest store content.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import ListPresenter from './list-presenter';

export default ListPresenter.extend({
  /**
   * @override
   */
  fetchEntriesCallback: computed(
    'getStoreContentCallback',
    function fetchEntriesCallback() {
      return async (listingParams) => {
        const results = await this.getStoreContentCallback({
          type: 'treeForestStoreContentBrowseOptions',
          ...listingParams,
        });
        return {
          entries: results.items,
          isLast: results.isLast,
        };
      };
    }
  ),
});
