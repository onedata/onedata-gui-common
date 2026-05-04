/**
 * An infinite scroll sidebar to use with `model.collection` of
 * `ChunkableListModelSidebarCollection` type.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import InfiniteScrollSidebar from 'onedata-gui-common/components/infinite-scroll-sidebar';
import { reads } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import EmberObject, { computed } from '@ember/object';

export default class ChunkableListModelSidebar extends InfiniteScrollSidebar {
  /**
   * Should contain all known items ordered by index.
   * @override
   */
  @reads('model.collection.fullArray')
  sortedCollection;

  /**
   * Disable OneSidebar filtering features - the filtering will be set on the collection
   * object.
   * @override
   */
  @reads('model.collection.array')
  filteredCollection;

  /**
   * @override
   */
  @computed
  get context() {
    return ChunkableListModelSidebarContext.create({
      sidebar: this,
    });
  }

  /**
   * @override
   * @param {string} expression
   */
  setFilter(expression) {
    super.setFilter(expression);
    // Editing simple expression filter should be debounced to no invoke list reload
    // when user changes the input.
    debounce(this, 'updateVirtualListFilter', 500);
  }

  /**
   * @override
   * @param {TokensSidebarAdvancedFilter} advancedFilter
   */
  setAdvancedFilter(advancedFilter) {
    super.setAdvancedFilter(advancedFilter);
    this.updateVirtualListFilter();
  }

  /**
   * @override
   * @param {HTMLElement} element
   * @returns {Promise}
   */
  async mountInfiniteScroll(element) {
    await super.mountInfiniteScroll(element);
    if (this.isDestroyed) {
      return;
    }
    const chunkableListModelReloader =
      this.model.collection.chunkableListModel.chunkableListModelReloader;
    chunkableListModelReloader.onListChanged = async () => {
      if (!this.isDestroyed && this.primaryItem) {
        this.handlePrimaryItemChange();
      }
    };
  }

  /**
   * Sets filters from sidebar instance to the SidebarCollection instance.
   * @returns {void}
   */
  updateVirtualListFilter() {
    this.model.collection.setFilter({
      expression: this.filter,
      advanced: this.advancedFilters,
      isSearchById: this.isSearchById,
    });
  }
}

class ChunkableListModelSidebarContext extends EmberObject {
  /** @type {Components.OneSidebar} */
  sidebar = undefined;

  @reads('sidebar.sortedCollection')
  sortedCollection;

  @reads('sidebar.model.collection.filteredFullArray')
  visibleCollection;
}
