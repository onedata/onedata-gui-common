/**
 * A facade that offers all common infinite scroll classes features:
 * - handling scroll event and managing visible infinite list fragment
 * - computing model of first row
 * - providing status of "fetch more" spinners
 * - auto-updating of list (must be enabled manually using `listUpdater`)
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import ScrollHandler from './infinite-scroll/scroll-handler';
import FetchingStatus from './infinite-scroll/fetching-status';
import FirstRowModel from './infinite-scroll/first-row-model';
import ListUpdater from './infinite-scroll/list-updater';
import { reads } from '@ember/object/computed';

/**
 * @typedef {Object} InfiniteListQuery
 * @property {string|null} [index] an anchor where the listing should start. Every item
 *   received from the backend has that field so it is ease to start from the specific log
 *   entry.
 * @property {number} [limit] how many items should be fetched
 * @property {number} [offset] says where the listing should start relative to the
 *   provided `index`|`timestamp`. Default is 0 which means that the specified item
 *   will be the first one in the results. When negative integer is provided, the listing
 *   will start before specified item. When it is a positive integer, it will omit
 *   that number of entries during the listing.
 */

export default EmberObject.extend({
  /**
   * @virtual
   * @type {ReplacingChunksArray<Object>}
   */
  entries: undefined,

  /**
   * @virtual
   * @type {number}
   */
  singleRowHeight: 0,

  /**
   * Property of record that contains ID of record. Should be the same as `data-row-id` of
   * items in template.
   * @virtual
   * @type {string} optional
   */
  itemIdProperty: 'id',

  /**
   * @virtual
   * @type {({ headerVisible: boolean }) => void}
   */
  onScroll: undefined,

  //#region state

  /**
   * @type {HTMLElement}
   */
  listContainerElement: undefined,

  /**
   * @type {Utils.InfiniteScroll.FetchingStatus}
   */
  fetchingStatus: undefined,

  /**
   * @type {Utils.InfiniteScroll.FirstRowModel}
   */
  firstRowModel: undefined,

  /**
   * @type {Utils.InfiniteScroll.ScrollHandler}
   */
  scrollHandler: undefined,

  /**
   * @type {Utils.InfiniteScroll.ListUpdater}
   */
  listUpdater: undefined,

  //#endregion

  isAutoUpdating: reads('listUpdater.isActive'),

  firstRowStyle: reads('firstRowModel.style'),

  init() {
    this._super(...arguments);
    this.initFetchingStatus();
    this.initListUpdater();
    this.initFirstRowModel();
  },

  /**
   * @override
   */
  willDestroy() {
    this.scrollHandler?.destroy();
    this.listUpdater?.destroy();
    this.fetchingStatus?.destroy();
  },

  /**
   * @public
   * @param {HTMLElement} listContainerElement
   * @param {HTMLElement} [scrollableContainerElement]
   */
  mount(
    listContainerElement,
    scrollableContainerElement = listContainerElement?.closest('.ps')
  ) {
    this.setProperties({
      listContainerElement,
      scrollableContainerElement,
    });
    this.initScrollHandler();
  },

  /**
   * @public
   * @param {boolean} immediate if true, do first update right after method invocation
   */
  startAutoUpdate(immediate = false) {
    this.listUpdater.start(immediate);
  },

  /**
   * @public
   */
  stopAutoUpdate() {
    this.listUpdater.stop();
  },

  initFetchingStatus() {
    const entries = this.get('entries');
    this.set('fetchingStatus', FetchingStatus.create({
      entries,
    }));
  },

  initScrollHandler() {
    const {
      scrollableContainerElement,
      listContainerElement,
      entries,
      firstRowModel,
      singleRowHeight,
      itemIdProperty,
      onScroll,
    } = this;
    this.set('scrollHandler', ScrollHandler.create({
      scrollableContainerElement,
      listContainerElement,
      entries,
      firstRowModel,
      singleRowHeight,
      itemIdProperty,
      onScroll,
    }));
  },

  initListUpdater() {
    this.set('listUpdater', ListUpdater.create({
      entries: this.entries,
    }));
  },

  initFirstRowModel() {
    const {
      singleRowHeight,
      entries,
    } = this;
    this.set('firstRowModel', FirstRowModel.create({
      singleRowHeight,
      entries,
    }));
  },
});
