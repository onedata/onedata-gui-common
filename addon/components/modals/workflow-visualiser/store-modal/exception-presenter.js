/**
 * Shows exception store content.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
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
          type: 'exceptionStoreContentBrowseOptions',
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
});
