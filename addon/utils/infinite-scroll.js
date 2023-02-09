/**
 * A facade that offers all common infinite scroll classes features:
 * - handling scroll event and managing visible infinite list fragment
 * - computing model of first row
 * - providing status of "fetch more" spinners
 * - auto-updating of list (must be enabled manually using `listUpdater`)
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject from '@ember/object';
import ScrollHandler from './infinite-scroll/scroll-handler';
import FetchingStatus from './infinite-scroll/fetching-status';
import FirstRowModel from './infinite-scroll/first-row-model';
import ListUpdater from './infinite-scroll/list-updater';
import { reads } from '@ember/object/computed';

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
   * @public
   * @param {HTMLElement} listContainerElement
   */
  mount(listContainerElement) {
    this.set('listContainerElement', listContainerElement);
    this.initScrollHandler();
  },

  /**
   * @public
   * @param {boolean} immediate if true, do first update right after method invocation
   */
  startAutoUpdate(immediate = false) {
    this.get('listUpdater').start(immediate);
  },

  /**
   * @public
   */
  stopAutoUpdate() {
    this.get('listUpdater').stop();
  },

  destroy() {
    const {
      scrollHandler,
      listUpdater,
      fetchingStatus,
    } = this.getProperties('scrollHandler', 'listUpdater', 'fetchingStatus');
    if (scrollHandler) {
      scrollHandler.destroy();
    }
    if (listUpdater) {
      listUpdater.destroy();
    }
    if (fetchingStatus) {
      fetchingStatus.destroy();
    }
  },

  initFetchingStatus() {
    const entries = this.get('entries');
    this.set('fetchingStatus', FetchingStatus.create({
      entries,
    }));
  },

  initScrollHandler() {
    const {
      listContainerElement,
      entries,
      firstRowModel,
    } = this.getProperties(
      'listContainerElement',
      'entries',
      'firstRowModel',
    );
    this.set('scrollHandler', ScrollHandler.create({
      listContainerElement,
      entries,
      firstRowModel,
      onScroll: this.get('onScroll'),
    }));
  },

  initListUpdater() {
    const entries = this.get('entries');
    this.set('listUpdater', ListUpdater.create({
      entries,
    }));
  },

  initFirstRowModel() {
    const {
      singleRowHeight,
      entries,
    } = this.getProperties(
      'singleRowHeight',
      'entries',
    );
    this.set('firstRowModel', FirstRowModel.create({
      singleRowHeight,
      entries,
    }));
  },
});
