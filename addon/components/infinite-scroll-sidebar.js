/**
 * FIXME: doc
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { debounce } from '@ember/runloop';

export default class extends OneSidebar {
  /**
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
   * Height of single sidebar primary item in px.
   * @type {number}
   */
  get rowHeight() {
    return 50;
  }

  @reads('model.collection.chunksArray') chunksArray;

  @computed('chunksArray')
  get infiniteScroll() {
    return InfiniteScroll.create({
      entries: this.chunksArray,
      singleRowHeight: this.rowHeight,
      itemIdProperty: 'entityId',
    });
  }

  /**
   * @override
   */
  didInsertElement() {
    super.didInsertElement(...arguments);
    this.mountInfiniteScroll(this.element);
  }

  /**
   * @override
   */
  willDestroy() {
    super.willDestroy(...arguments);
    this.infiniteScroll?.destroy();
  }

  /**
   * @override
   */
  async handlePrimaryItemChange() {
    if (!this.primaryItem) {
      return;
    }
    // scrollSidebarToActiveItem does the array jump internally
    await this.scrollSidebarToActiveItem();
    await waitForRender();
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    // After jump, the list has no front loaded, executing scroll handler causes
    // the InfiniteScroll toolkit to trigger fetch prev.
    this.infiniteScroll.scrollHandler.listWatcher.scrollHandler();
  }

  /**
   * @override
   * @param {string} expression
   */
  setFilter(expression) {
    super.setFilter(expression);
    debounce(this, 'setVirtualListFilter', 500);
  }

  /**
   * @param {HTMLElement} element
   * @returns {Promise}
   */
  async mountInfiniteScroll(element) {
    const chunksArray = this.infiniteScroll.entries;
    await chunksArray.initialLoad;
    await waitForRender();
    /** @type {HTMLElement} */
    const itemsTable = element.querySelector('.one-sidebar-primary-item-list');
    this.infiniteScroll.mount(itemsTable);
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
