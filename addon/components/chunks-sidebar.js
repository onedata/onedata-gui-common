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
import ConflictIdsArray from 'onedata-gui-common/utils/conflict-ids-array';

export default class ChunksSidebar extends InfiniteScrollSidebar {
  /**
   * There is no support for filtering in infinite scroll methods in backend.
   * @override
   */
  isFilteringEnabled = false;

  /**
   * Fetched array is considered to be sorted by index. There is no standard conflict
   * labels adding in lower levels of implementation, so add conflict labels here.
   * @type {ConflictIdsArray}
   */
  conflictArray;

  /**
   * @override
   */
  @reads('model.collection.chunksArray') sortedCollection;

  /**
   * Disable filtering features.
   * @override
   */
  @reads('sortedCollection') filteredCollection;

  init() {
    super.init(...arguments);
    // FIXME: zmienić na coś w rodzaju watchera (rozbić albo wyciągnąć z tej klasy arraya esencję)
    const conflictArray = ConflictIdsArray.create({
      content: this.model.collection.chunksArray,
      diffProperty: 'entityId',
      conflictProperty: 'name',
    });
    this.set('conflictArray', conflictArray);
    this.addObserver(
      'navigationState.activeResource',
      this,
      'handleActiveResourceChange',
      false
    );
  }

  async handleActiveResourceChange() {
    const activeResource = this.navigationState.activeResource;
    if (!activeResource) {
      return false;
    }
    const includes = this.chunksArray.map(({ id }) => id).includes(activeResource.id);
    if (!includes) {
      await this.chunksArray.scheduleJump(activeResource.index, 50);
    }
  }

  /**
   * @override
   */
  willDestroy() {
    try {
      this.conflictArray?.destroy();
    } finally {
      super.willDestroy(...arguments);
    }
  }
}
