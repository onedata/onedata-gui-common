/**
 * Changes range of displayed entries basing on current view state.
 * The procedure of range changing is triggered by scroll events, for which this class
 * registers.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  get,
  getProperties,
  setProperties,
  observer,
} from '@ember/object';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { schedule, next } from '@ember/runloop';
import ListWatcher from 'onedata-gui-common/utils/list-watcher';
import $ from 'jquery';

export default EmberObject.extend({
  /**
   * @virtual
   * @type {ReplacingChunksArray}
   */
  entries: undefined,

  /**
   * @virtual
   * @type {InfiniteScroll.FirstRowModel}
   */
  firstRowModel: undefined,

  /**
   * @virtual
   * @type {HTMLElement}
   */
  listContainerElement: undefined,

  /**
   * @virtual
   * @type {HTMLElement}
   */
  scrollableContainerElement: undefined,

  /**
   * @virtual
   * @type {number}
   */
  singleRowHeight: 0,

  /**
   * @virtual optional
   * @type {({ headerVisible: boolean }) => void}
   */
  onScroll: undefined,

  /**
   * @type {Window}
   */
  _window: window,

  fallbackEndIndex: 50,

  //#region state

  headerVisible: true,

  /**
   * @type {Utils.ListWatcher}
   */
  listWatcher: undefined,

  /**
   * When scroll position is changed by code, use this flag to ignore next scroll event.
   * @type {boolean}
   */
  ignoreNextScroll: false,

  //#endregion

  /**
   * @param {Array<HTMLElement>} items
   * @param {boolean} headerVisible
   */
  onTableScroll(items, headerVisible) {
    if (this.ignoreNextScroll) {
      this.set('ignoreNextScroll', false);
      return;
    }

    const {
      _window,
      listContainerElement,
      fallbackEndIndex,
      entries,
      firstRowModel,
      onScroll,
    } = this.getProperties(
      '_window',
      'listContainerElement',
      'fallbackEndIndex',
      'entries',
      'firstRowModel',
      'onScroll',
    );
    if (!firstRowModel) {
      return;
    }

    const sourceArray = this.get('entries.sourceArray');
    const entriesIds = sourceArray.mapBy('id');
    const firstNonEmptyRow = items.find(elem => elem.getAttribute('data-row-id'));
    const firstId =
      firstNonEmptyRow && firstNonEmptyRow.getAttribute('data-row-id') || null;
    const lastId = items[items.length - 1] &&
      items[items.length - 1].getAttribute('data-row-id') || null;

    let startIndex;
    let endIndex;
    if (firstId === null && get(sourceArray, 'length') !== 0) {
      const rowHeight = get(firstRowModel, 'singleRowHeight');
      const $firstRow = $(listContainerElement.querySelector('.first-row'));
      const firstRowTop = $firstRow.offset().top;
      const blankStart = firstRowTop * -1;
      const blankEnd = blankStart + _window.innerHeight;
      startIndex = firstRowTop < 0 ?
        Math.floor(blankStart / rowHeight) : 0;
      endIndex = Math.floor(blankEnd / rowHeight);
      if (endIndex < 0) {
        endIndex = fallbackEndIndex;
      }
    } else {
      startIndex = entriesIds.indexOf(firstId);
      endIndex = entriesIds.indexOf(lastId, startIndex);
    }

    const {
      startIndex: oldStartIndex,
      endIndex: oldEndIndex,
    } = getProperties(entries, 'startIndex', 'endIndex');
    if (oldStartIndex !== startIndex || oldEndIndex !== endIndex) {
      setProperties(entries, { startIndex, endIndex });
    }
    safeExec(this, 'set', 'headerVisible', headerVisible);
    onScroll?.({ headerVisible });
  },

  entriesLoadedObserver: observer(
    'entries.isLoaded',
    function entriesLoadedObserver() {
      if (!this.get('entries.isLoaded')) {
        return;
      }

      this.tryDestroyListWatcher();
      next(() => safeExec(this, () => {
        const listWatcher = this.set('listWatcher', this.createListWatcher());
        listWatcher.scrollHandler();
      }));
    }
  ),

  init() {
    this._super(...arguments);
    this.bindScrollAdjustHandler();
    this.entriesLoadedObserver();
  },

  /**
   * @override
   */
  destroy() {
    try {
      this.tryDestroyListWatcher();
    } finally {
      this._super(...arguments);
    }
  },

  createListWatcher() {
    const listContainerElement = this.get('listContainerElement');
    return new ListWatcher(
      $(listContainerElement.closest('.ps')),
      '.data-row',
      (items, headerVisible) => {
        return safeExec(this, 'onTableScroll', items, headerVisible);
      },
      '.table-start-row'
    );
  },

  tryDestroyListWatcher() {
    const listWatcher = this.get('listWatcher');
    if (listWatcher) {
      listWatcher.destroy();
    }
  },

  bindScrollAdjustHandler() {
    this.entries.on(
      'willChangeArrayBeginning',
      async ({ updatePromise, newItemsCount }) => {
        await updatePromise;
        safeExec(this, () => {
          this.adjustScrollAfterBeginningChange(newItemsCount);
        });
      }
    );
  },

  /**
   * When entries array gets expanded on the beginning (items are unshifted into
   * array), we need to compensate scroll because new content is added on top.
   * Currently (as of 2021) not all browsers support scroll anchoring and
   * `perfect-scrollbar` has issues with it (anchoring is disabled), so we need to do
   * scroll correction manually.
   * @param {number} newItemsCount how many items have been added to the beginning
   *   of the list
   * @returns {void}
   */
  adjustScrollAfterBeginningChange(newEntriesCount = 0) {
    const topDiff = newEntriesCount * this.singleRowHeight;
    if (topDiff <= 0 || !this.scrollableContainerElement) {
      return;
    }

    this.set('ignoreNextScroll', true);
    schedule('afterRender', this, () => {
      window.requestAnimationFrame(() => {
        safeExec(this, () => {
          this.scrollTo(
            null,
            this.scrollableContainerElement.scrollTop + topDiff
          );
        });
      });
    });
  },

  /**
   * @param  {...any} params The same parameters as in `HTMLElement.scrollTo` method.
   * @return {void}
   */
  scrollTo(...params) {
    if (this.scrollableContainerElement) {
      this.scrollableContainerElement.scrollTo(...params);
    }
  },
});
