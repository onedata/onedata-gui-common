/**
 * Array that fetches additional chunks of data if requesting indices
 * that are not currently loaded
 *
 * @module utils/replacing-chunks-array
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ArraySlice from 'onedata-gui-common/utils/array-slice';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { get, set, computed, observer } from '@ember/object';
import { A } from '@ember/array';
import _ from 'lodash';

export const emptyItem = {};

export default ArraySlice.extend({
  /**
   * @virtual 
   * @type {function} `(fromIndex, size, offset) => Array<any>`
   */
  fetch: undefined,

  startIndex: 0,
  endIndex: 0,
  indexMargin: 0,

  emptyIndex: -1,

  /**
   * @type {function}
   */
  sortFun(a, b) {
    const ai = get(a, 'index');
    const bi = get(b, 'index');
    if (ai < bi) {
      return -1;
    } else if (ai > bi) {
      return 1;
    } else {
      return 0;
    }
  },

  /**
   * Initialized in init
   * @type {PromiseObject<ReplacingChunksArray>}
   */
  initialLoad: undefined,

  /**
   * Stores fetch error if at least one item cannot be fetched
   * @type {any}
   */
  error: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLoaded: computed.reads('initialLoad.isSettled'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLoading: computed.not('isLoaded'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isReloading: computed.reads('_isReloading'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  chunkSize: computed.reads('maxLength'),

  loadMoreThreshold: computed('chunkSize', function getLoadMoreThreshold() {
    return this.get('chunkSize') / 2;
  }),

  /**
   * @type {boolean}
   */
  _startReached: true,

  /**
   * @type {boolean}
   */
  _endReached: false,

  /**
   * Prevents infinite recursion when fetching new data
   * @type {boolean}
   */
  _fetchNextLock: false,

  /**
   * Prevents infinite recursion when fetching new data
   * @type {boolean}
   */
  _fetchPrevLock: false,

  /**
   * Set to true if reloading is in progress
   * @type {boolean}
   */
  _isReloading: false,

  startEndChanged: observer(
    '_start',
    '_end',
    '_startReached',
    '_endReached',
    'loadMoreThreshold',
    'sourceArray.[]',
    function observeStartEndChanged() {
      if (!this.get('isReloading')) {
        const {
          _start,
          _end,
          loadMoreThreshold,
          _startReached,
          _endReached,
          sourceArray,
          emptyIndex,
        } = this.getProperties(
          '_start',
          '_end',
          'loadMoreThreshold',
          '_startReached',
          '_endReached',
          'sourceArray',
          'emptyIndex',
        );
        const sourceArrayLength = get(sourceArray, 'length');
        if (!sourceArrayLength || !_startReached && _start < emptyIndex) {
          this.fetchPrev();
        }
        if (!_endReached && _end + loadMoreThreshold >= get(sourceArray, 'length')) {
          this.fetchNext();
        }
      }
    }),

  fetchPrev() {
    if (!this.get('_fetchPrevLock')) {
      this.set('_fetchPrevLock', true);

      const {
        _startReached,
        sourceArray,
        chunkSize,
        emptyIndex,
      } = this.getProperties('_startReached', 'sourceArray', 'chunkSize', 'emptyIndex');

      const firstItem = sourceArray[emptyIndex + 1];
      const firstIndex = firstItem ? get(firstItem, 'index') : null;

      const currentChunkSize = _startReached ?
        Math.min(emptyIndex + 1, chunkSize) : chunkSize;

      return this.get('fetch')(
        firstIndex,
        currentChunkSize,
        -currentChunkSize
      ).then(arrayUpdate => {
        // TODO: use of pullAllBy is working, but it is probably unsafe
        // it can remove items from update, while they should stay there
        // because some entries "fallen down" from further part of array
        // it should be tested
        _.pullAllBy(arrayUpdate, sourceArray, 'id');
        const fetchedArraySize = get(arrayUpdate, 'length')
        let insertIndex = emptyIndex + 1 - fetchedArraySize;
        console.log(
          'FIXME: fetchPrev', firstIndex, currentChunkSize,
          fetchedArraySize, insertIndex
        );
        if (fetchedArraySize < currentChunkSize) {
          safeExec(this, 'set', '_startReached', true);
        }
        if (insertIndex < 0) {
          sourceArray.unshift(...new Array(fetchedArraySize - emptyIndex));
          insertIndex = 0;
        }
        for (let i = 0; i < fetchedArraySize; ++i) {
          sourceArray[i + insertIndex] = arrayUpdate[i];
        }
        this.set('emptyIndex', insertIndex - 1);
        sourceArray.arrayContentDidChange();
      }).finally(() => safeExec(this, 'set', '_fetchPrevLock', false));
    }
  },

  fetchNext() {
    if (!this.get('_fetchNextLock')) {
      this.set('_fetchNextLock', true);

      const {
        sourceArray,
        chunkSize,
      } = this.getProperties('sourceArray', 'chunkSize');

      const lastItem = sourceArray[get(sourceArray, 'length') - 1];

      const fetchSize = chunkSize;

      return this.get('fetch')(
        // TODO: something is broken, because sourceArray.get('lastObject') gets wrong element
        // and items are converted from plain objects to EmberObjects
        // the workaround is to use []
        lastItem ? get(lastItem, 'index') : null,
        fetchSize,
        lastItem ? 1 : 0
      ).then(array => {
        if (get(array, 'length') < chunkSize) {
          safeExec(this, 'set', '_endReached', true);
        }
        sourceArray.push(...array);
        sourceArray.arrayContentDidChange();
      }).finally(() => safeExec(this, 'set', '_fetchNextLock', false));
    }
  },

  reload({ head = false, minSize = 0, offset = 0 } = {}) {
    const {
      _start,
      _end,
      startIndex,
      endIndex,
      sourceArray,
      indexMargin,
    } = this.getProperties(
      '_start',
      '_end',
      'startIndex',
      'endIndex',
      'sourceArray',
      'indexMargin',
    );

    // currently, if data is not loaded between start and startIndex
    const lastSourceIndex = get(sourceArray, 'length') - 1;
    let reloadStart = Math.min(lastSourceIndex, _start, startIndex);
    let reloadEnd = Math.max(_end, endIndex);
    if (reloadEnd === -1) {
      reloadEnd = 0;
    }
    if (reloadStart === -1) {
      reloadStart = 0;
    }
    let size = reloadEnd + indexMargin - reloadStart;
    if (size < minSize) {
      size = minSize;
    }
    this.set('_isReloading', true);
    const firstObject = this.objectAt(0);
    let firstObjectIndex = firstObject && get(firstObject, 'index');
    if (firstObjectIndex === undefined || head || _start === 0) {
      firstObjectIndex = null;
    }
    return this.get('fetch')(
        firstObjectIndex,
        size,
        offset
      ).then(updatedRecordsArray => {
        const fetchedCount = get(updatedRecordsArray, 'length');
        const updatedEnd = _start + fetchedCount;
        safeExec(this, 'setProperties', {
          _startReached: false,
          _endReached: false,
          error: undefined,
        });
        const emptyIndex = this.set('emptyIndex', _start - 1);
        if (updatedEnd < get(sourceArray, 'length')) {
          set(sourceArray, 'length', updatedEnd);
        }
        for (let i = 0; i <= emptyIndex; ++i) {
          sourceArray[i] = emptyItem;
        }
        for (let i = 0; i < Math.min(updatedEnd, fetchedCount); ++i) {
          sourceArray[i + _start] = updatedRecordsArray[i];
        }
        sourceArray.arrayContentDidChange(_start, );
        return this;
      })
      .catch(error => {
        safeExec(this, 'set', 'error', error);
      })
      .finally(() => safeExec(this, 'set', '_isReloading', false));
  },

  init() {
    if (!this.get('sourceArray')) {
      this.set('sourceArray', A());
    }
    this._super(...arguments);
    this.set(
      'initialLoad',
      PromiseObject.create({ promise: this.reload({ head: true }) })
    );
  },
});
