/**
 * Shows store content using table layout combined with infinite scroll.
 *
 * @module components/modals/workflow-visualiser/store-modal/store-content-table
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/store-content-table';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get, getProperties } from '@ember/object';
import { htmlSafe } from '@ember/string';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
// TODO: VFS-7959 uncomment when infinite scroll reload will be fixed
// import Looper from 'onedata-gui-common/utils/looper';
import { next } from '@ember/runloop';
import ListWatcher from 'onedata-gui-common/utils/list-watcher';
import { isEmpty } from '@ember/utils';
import StoreContentTableColumns from 'onedata-gui-common/utils/workflow-visualiser/store-content-table-columns';
import { inject as service } from '@ember/service';

/**
 * @typedef {StoreContentEntry} StoreContentTableEntry
 * @property {String} id the same as `index`
 */

// TODO: VFS-7874 create common initite scroll view logic
export default Component.extend(I18n, {
  layout,
  classNames: ['store-content-table'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.storeContentTable',

  /**
   * @virtual
   * @type {Object}
   */
  store: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  getStoreContentCallback: notImplementedReject,

  /**
   * @virtual
   * @type {String}
   */
  emptyStoreText: undefined,

  /**
   * @type {Number}
   */
  rowHeight: 44,

  // TODO: VFS-7959 uncomment when infinite scroll reload will be fixed
  // /**
  //  * @type {Number}
  //  */
  // updateInterval: 5000,

  // /**
  //  * @type {Utils.Looper}
  //  */
  // updater: undefined,

  /**
   * If true, should render top loading indicator
   * @type {Boolean}
   */
  fetchingPrev: false,

  /**
   * If true, should render bottom loading indicator
   * @type {Boolean}
   */
  fetchingNext: false,

  /**
   * @type {Utils.WorkflowVisualiser.StoreContentTableColumns}
   */
  tableColumnsGenerator: undefined,

  /**
   * @type {Array<StoreContentTableColumn>}
   */
  tableColumns: undefined,

  /**
   * @type {String}
   */
  expandedEntryIndex: undefined,

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @type {ComputedProperty<Number>}
   */
  firstRowHeight: computed(
    'rowHeight',
    'storeEntries._start',
    function firstRowHeight() {
      const _start = this.get('storeEntries._start');
      return _start ? _start * this.get('rowHeight') : 0;
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  firstRowStyle: computed('firstRowHeight', function firstRowStyle() {
    return htmlSafe(`height: ${this.get('firstRowHeight')}px;`);
  }),

  /**
   * @type {ComputedProperty<ReplacingChunksArray<StoreContentTableEntry>>}
   */
  storeEntries: computed('store', function storeEntries() {
    return ReplacingChunksArray.create({
      fetch: this.fetchStoreEntries.bind(this),
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
  }),

  init() {
    this._super(...arguments);

    const {
      store,
      i18n,
    } = this.getProperties('store', 'i18n');
    const {
      type,
      dataSpec,
    } = getProperties(store, 'type', 'dataSpec');
    this.set(
      'tableColumnsGenerator',
      new StoreContentTableColumns(type, dataSpec, i18n)
    );
    this.updateTableColumns();
    // TODO: VFS-7959 uncomment when infinite scroll reload will be fixed
    //   this.startUpdater();
  },

  didInsertElement() {
    this._super(...arguments);

    this.get('storeEntries.initialLoad').then(() => {
      next(() => {
        const listWatcher = this.set('listWatcher', this.createListWatcher());
        listWatcher.scrollHandler();
      });
    });
  },

  willDestroyElement() {
    try {
      const listWatcher = this.get('listWatcher');
      listWatcher && listWatcher.destroy();
      // TODO: VFS-7959 uncomment when infinite scroll reload will be fixed
      // this.stopUpdater();
    } finally {
      this._super(...arguments);
    }
  },

  // TODO: VFS-7959 uncomment when infinite scroll reload will be fixed
  // startUpdater() {
  //   const store = this.get('store');
  //   if (!get(store, 'contentMayChange')) {
  //     return;
  //   }

  //   const updater = Looper.create({
  //     immediate: false,
  //     interval: this.get('updateInterval'),
  //   });
  //   updater.on('tick', () => {
  //     this.updateStoreEntries();
  //     // Stopping updater after `updateStoreEntries` call, because there could be some
  //     // changes in store content between moment of the last update and
  //     // `contentMayChange` property change.
  //     if (!get(store, 'contentMayChange')) {
  //       this.stopUpdater();
  //     }
  //   });
  //   this.set('updater', updater);
  // },

  // stopUpdater() {
  //   const updater = this.get('updater');
  //   updater && safeExec(updater, () => updater.destroy());
  // },

  updateTableColumns() {
    this.set('tableColumns', this.get('tableColumnsGenerator').getColumns());
  },

  async fetchStoreEntries() {
    const {
      getStoreContentCallback,
      store,
    } = this.getProperties('getStoreContentCallback', 'store');

    const result = await getStoreContentCallback(
      get(store, 'id'),
      ...arguments,
    );
    const entries = result && result.array;
    // Store entries does not have id, which is required by replacing chunks array.
    // Solution: using entry index as id.
    entries && entries.forEach(entry => entry.id = entry.index);
    safeExec(this, () => {
      this.get('tableColumnsGenerator').updateColumnsWithNewData(entries);
      this.updateTableColumns();
    });

    return result;
  },

  // TODO: VFS-7959 uncomment when infinite scroll reload will be fixed
  // async updateStoreEntries() {
  //   await this.get('storeEntries').reload();
  // },

  createListWatcher() {
    return new ListWatcher(
      this.$('.scrollable-table > .ps'),
      '.data-row',
      items => {
        if (this.$().parents('.store-modal').hasClass('in')) {
          return safeExec(this, 'onTableScroll', items);
        }
      }
    );
  },

  /**
   * @param {Array<HTMLElement>} items
   */
  onTableScroll(items) {
    const {
      storeEntries,
      listWatcher,
    } = this.getProperties(
      'storeEntries',
      'listWatcher',
    );
    const sourceArray = get(storeEntries, 'sourceArray');

    if (isEmpty(items) && !isEmpty(sourceArray)) {
      storeEntries.setProperties({ startIndex: 0, endIndex: 50 });
      return;
    }

    const storeEntriesIds = sourceArray.mapBy('id');
    const firstNonEmptyRow = items.find(elem => elem.getAttribute('data-row-id'));
    const firstId =
      firstNonEmptyRow && firstNonEmptyRow.getAttribute('data-row-id') || null;
    const lastId = items[items.length - 1] &&
      items[items.length - 1].getAttribute('data-row-id') || null;

    let startIndex;
    let endIndex;
    if (firstId === null && get(sourceArray, 'length') !== 0) {
      const {
        _window,
        rowHeight,
      } = this.getProperties('_window', 'rowHeight');
      const $firstRow = this.$('.first-row');
      const firstRowTop = $firstRow.offset().top;
      const blankStart = firstRowTop * -1;
      const blankEnd = blankStart + _window.innerHeight;
      startIndex = firstRowTop < 0 ? Math.floor(blankStart / rowHeight) : 0;
      endIndex = Math.max(Math.floor(blankEnd / rowHeight), 0);
    } else {
      startIndex = storeEntriesIds.indexOf(firstId);
      endIndex = storeEntriesIds.indexOf(lastId, startIndex);
    }

    storeEntries.setProperties({ startIndex, endIndex });

    next(() => {
      const isBackwardLoading = startIndex > 0 &&
        get(storeEntries, 'firstObject.id') === firstId;
      if (isBackwardLoading) {
        listWatcher.scrollHandler();
      }
    });
  },

  actions: {
    expandEntry(entryIndex) {
      this.set('expandedEntryIndex', entryIndex);
    },
    collapseEntry(entryIndex) {
      if (entryIndex === this.get('expandedEntryIndex')) {
        this.set('expandedEntryIndex', undefined);
      }
    },
  },
});
