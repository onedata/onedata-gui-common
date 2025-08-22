/**
 * A base for implementing specific types of infinite scroll sidebars in Onedata main
 * layout. This is an abstract implementation - to create a specific sidebar component,
 * use `ChunkableListModelSidebar`
 or `ChunksArraySidebar`.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import { reads } from '@ember/object/computed';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { computed } from '@ember/object';

export default class InfiniteScrollSidebar extends OneSidebar {
  /**
   * @type {Utils.InfiniteScroll}
   */
  infiniteScroll = undefined;

  /**
   * Height of single sidebar primary item in px.
   * @type {number}
   */
  get rowHeight() {
    // the same as $sidebar-item-line-height-desktop in SCSS
    return 50;
  }

  /**
   * In sidebar, primary items are typically expanded to have secondary items, so they
   * have greater height than regular items. Define epirical height of these items for
   * specific sidebar implementation to make infinite scroll work with non-regular items
   * on the list.
   * @type {number}
   */
  get primaryItemHeight() {
    return this.rowHeight;
  }

  @reads('model.collection.chunksArray')
  chunksArray;

  @computed(
    'primaryItemId',
    // Due to some issues with ReplacingChunksArray.sourceArray notifications, we observe
    // `[]` of RCA, which causes recomputation practically on every scroll, which is bad
    // for performance. Maybe it will be fixed in the future.
    'chunksArray.[]'
  )
  get primaryItemSourceArrayIndex() {
    const primaryItemId = this.primaryItemId;
    return this.chunksArray.sourceArray.toArray().findIndex(item =>
      item?.id === primaryItemId
    );
  }

  /**
   * @override
   */
  @computed(
    'chunksArray.{isReloading,initialLoad.isPending}',
    'infiniteScroll.fetchingStatus.isFetchingPrev'
  )
  get isPrevSpinnerShown() {
    return !this.chunksArray?.isReloading && (
      this.chunksArray.initialLoad.isPending ||
      this.infiniteScroll?.fetchingStatus.isFetchingPrev
    );
  }

  /**
   * @override
   */
  @computed(
    'chunksArray.initialLoad.isSettled',
    'infiniteScroll.fetchingStatus.isFetchingNext',
  )
  get isNextSpinnerShown() {
    return this.chunksArray?.initialLoad.isSettled &&
      this.infiniteScroll?.fetchingStatus.isFetchingNext;
  }

  /**
   * @override
   */
  init() {
    super.init(...arguments);
    if (!this.chunksArray) {
      throw new Error('InfiniteScrollSidebar: no this.chunksArray');
    }
    const infiniteScroll = InfiniteScroll.create({
      entries: this.chunksArray,
      singleRowHeight: this.rowHeight,
      itemIdProperty: 'entityId',
    });
    infiniteScroll.firstRowModel.styleHeightProperty = 'min-height';
    this.set('infiniteScroll', infiniteScroll);

    if (this.rowHeight !== this.primaryItemHeight) {
      // Set custom height computation for first row, because we have custom-height
      // primary item row.
      const sidebar = this;
      this.infiniteScroll.firstRowModel.computeHeight =
        function spacesSidebarComputeHeight(chunksArray, computeItemsHeight) {
          let additionalHeight = 0;
          const primaryItemSourceArrayIndex = sidebar.primaryItemSourceArrayIndex;
          if (
            primaryItemSourceArrayIndex !== -1 &&
            chunksArray._start > sidebar.primaryItemSourceArrayIndex
          ) {
            additionalHeight = sidebar.primaryItemHeight - sidebar.rowHeight;
          }
          const value = computeItemsHeight() + additionalHeight;
          return value;
        };
    }
  }

  /**
   * @override
   */
  async didInsertElement() {
    await this.mountInfiniteScroll(this.element);
    super.didInsertElement(...arguments);
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
    const shouldContinue = await super.handlePrimaryItemChange();
    if (shouldContinue === false) {
      return false;
    }
    await waitForRender();
    if (this.isDestroyed || this.isDestroying) {
      return false;
    }
    // After jump, the list has no front loaded, executing scroll handler causes
    // the InfiniteScroll toolkit to trigger fetch prev.
    this.infiniteScroll.scrollHandler?.listWatcher?.scrollHandler();
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
  }
}
