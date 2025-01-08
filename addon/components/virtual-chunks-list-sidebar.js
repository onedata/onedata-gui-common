/**
 * An infinite scroll sidebar to use with `model.collection` of
 * `VirtualListChunksSidebarCollection` type.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import InfiniteScrollSidebar from 'onedata-gui-common/components/infinite-scroll-sidebar';
import { reads } from '@ember/object/computed';
import { debounce } from '@ember/runloop';

// FIXME: ujednolicić nazewnictwo: VirtualListChunks albo VirtualChunksList

export default class VirtualChunksListSidebar extends InfiniteScrollSidebar {
  /**
   * Should contain all known items ordered by index.
   * @override
   */
  @reads('model.collection.fullArray') sortedCollection;

  /**
   * Disable OneSidebar filtering features - the filtering will be set on the collection
   * object.
   * @override
   */
  @reads('model.collection.array') filteredCollection;

  /**
   * @override
   * @param {string} expression
   */
  setFilter(expression) {
    super.setFilter(expression);
    debounce(this, 'setVirtualListFilter', 500);
  }

  /**
   * @override
   * @param {HTMLElement} element
   * @returns {Promise}
   */
  async mountInfiniteScroll(element) {
    await super.mountInfiniteScroll(element);
    const virtualListReloader =
      this.model.collection.virtualListChunksArray.virtualListReloader;
    virtualListReloader.onListChanged = async () => {
      // FIXME: próba optymalizacji: jeśli po renderze aktywny item nie jest na widocznej liście
      if (this.primaryItem) {
        this.handlePrimaryItemChange();
      }
    };
  }

  setVirtualListFilter() {
    this.model.collection.setFilter(this.filter);
  }
}
