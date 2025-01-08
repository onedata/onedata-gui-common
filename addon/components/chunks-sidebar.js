/**
 * An infinite scroll sidebar to use with `model.collection` of
 * `ChunksArraySidebarCollection` type.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import InfiniteScrollSidebar from 'onedata-gui-common/components/infinite-scroll-sidebar';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import ConflictIdsArray from 'onedata-gui-common/utils/conflict-ids-array';

export default class ChunksSidebar extends InfiniteScrollSidebar {
  /**
   * There is no support for filtering in infinite scroll methods in backend.
   * @override
   */
  isFilteringEnabled = false;

  /**
   * Fetched array is considered to be sorted by index.
   * There is no standard conflict labels adding in lower levels of implementation, so add
   * conflict labels here.
   * @override
   */
  @computed('model.collection.array')
  get sortedCollection() {
    return ConflictIdsArray.create({
      content: this.model.collection.array,
      diffProperty: 'entityId',
      conflictProperty: 'name',
    });
  }

  /**
   * Disable filtering features.
   * @override
   */
  @reads('sortedCollection') filteredCollection;
}
