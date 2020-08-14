/**
 * Array that fetches additional chunks of data if requesting indices
 * that are not currently loaded
 *
 * @module utils/replacing-chunks-array
 * @author Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ArraySlice from 'onedata-gui-common/utils/array-slice';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { get, set, computed, observer } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import { math, writable } from 'ember-awesome-macros';
import { A } from '@ember/array';
import _ from 'lodash';
import { resolve, all as allFulfilled } from 'rsvp';
import Evented from '@ember/object/evented';

export const emptyItem = {};

export default ArraySlice.extend(Evented, {
  /**
   * @virtual 
   * @type {function} `(fromIndex, size, offset, replacingChunksArray) => Array<any>`
   */
  fetch: undefined,

  startIndex: 0,
  endIndex: 0,
  indexMargin: 0,

  emptyIndex: -1,

  /**
   * @virtual optional
   * If provided, the array will be initialized using object index, not fetch of data
   * using offset.
   * @type {String} anything that is an index in backend
   */
  initialJumpIndex: undefined,

  /**
   * @virtual optional
   * If `chunkSize` is computed from endIndex and startIndex, `chunkSize` will not be
   * smaller than this number
   */
  minChunkSize: 50,

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
  isLoaded: reads('initialLoad.isSettled'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isLoading: not('isLoaded'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isReloading: reads('_isReloading'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  chunkSize: writable(math.min('maxLength', 'minChunkSize')),

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

  startEndChanged() {
    return allFulfilled([this.startChanged(), this.endChanged()]);
  },

  startChanged: observer(
    '_start',
    '_startReached',
    'loadMoreThreshold',
    'sourceArray.[]',
    'emptyIndex',
    function startChanged() {
      if (!this.get('isReloading')) {
        const {
          _start,
          _startReached,
          loadMoreThreshold,
          sourceArray,
          emptyIndex,
        } = this.getProperties(
          '_start',
          '_startReached',
          'loadMoreThreshold',
          'sourceArray',
          'emptyIndex',
        );
        const sourceArrayLength = get(sourceArray, 'length');
        if (!sourceArrayLength ||
          !_startReached && _start - loadMoreThreshold <= emptyIndex
        ) {
          return this.fetchPrev();
        }
      }
    }
  ),

  endChanged: observer(
    '_end',
    '_endReached',
    'loadMoreThreshold',
    'sourceArray.[]',
    function startChanged() {
      if (!this.get('isReloading')) {
        const {
          _end,
          _endReached,
          loadMoreThreshold,
          sourceArray,
        } = this.getProperties(
          '_end',
          '_endReached',
          'loadMoreThreshold',
          'sourceArray',
        );
        if (!_endReached && _end + loadMoreThreshold >= get(sourceArray, 'length')) {
          return this.fetchNext();
        }
      }
    }
  ),

  getIndex(record) {
    return get(record, 'index');
  },

  countEndDuplicates(array) {
    const lastIndex = get(array, 'lastObject.index');
    if (lastIndex) {
      let count = 0;
      for (let i = get(array, 'length') - 2; i >= 0; --i) {
        if (this.getIndex(array.objectAt(i)) === lastIndex) {
          count += 1;
        } else {
          return count;
        }
      }
      return count;
    } else {
      return 0;
    }
  },

  fetchPrev() {
    const {
      _startReached,
      sourceArray,
      chunkSize,
      emptyIndex,
      fetch,
    } = this.getProperties(
      '_startReached',
      'sourceArray',
      'chunkSize',
      'emptyIndex',
      'fetch',
    );

    const firstItem = sourceArray[emptyIndex + 1];
    const fetchStartIndex = firstItem ? this.getIndex(firstItem) : null;

    const currentChunkSize = _startReached ?
      Math.min(emptyIndex + 1, chunkSize) : chunkSize;

    if (!currentChunkSize) {
      return resolve();
    }

    if (!this.get('_fetchPrevLock')) {
      this.set('_fetchPrevLock', true);

      this.trigger('fetchPrevStarted');
      return fetch(
          fetchStartIndex,
          currentChunkSize,
          -currentChunkSize,
          this,
        )
        .then(arrayUpdate => {
          // TODO: use of pullAllBy is working, but it is probably unsafe
          // it can remove items from update, while they should stay there
          // because some entries "fallen down" from further part of array
          // it should be tested
          _.pullAllBy(arrayUpdate, sourceArray, 'id');
          const fetchedArraySize = get(arrayUpdate, 'length');
          let insertIndex = emptyIndex + 1 - fetchedArraySize;
          // check if we have enough empty items on start to put new data
          if (insertIndex >= 0) {
            // add new entries on the front and set new insertIndex for further use
            for (let i = 0; i < fetchedArraySize; ++i) {
              sourceArray[i + insertIndex] = arrayUpdate[i];
            }
            safeExec(this, 'set', 'emptyIndex', insertIndex - 1);
            sourceArray.arrayContentDidChange();
          } else {
            // there is more data on the array start, so we must make additional space
            const additionalFrontSpace = fetchedArraySize - emptyIndex - 1;
            sourceArray.unshift(..._.times(
              additionalFrontSpace,
              _.constant(emptyItem)
            ));
            // insert index is now sourceArray beginning, add new entries
            insertIndex = 0;
            for (let i = insertIndex; i < fetchedArraySize; ++i) {
              sourceArray[i] = arrayUpdate[i];
            }
            const indexOffset = fetchedArraySize;
            this.setProperties({
              startIndex: this.get('startIndex') + indexOffset,
              endIndex: this.get('endIndex') + indexOffset,
            });
          }
          // fetched data without duplicated is less than requested,
          // so there is nothing left on the array start
          if (fetchedArraySize < currentChunkSize) {
            for (let i = 0; i < insertIndex; ++i) {
              sourceArray.shift();
            }
            this.setProperties({
              startIndex: this.get('startIndex') - insertIndex,
              endIndex: this.get('endIndex') - insertIndex,
              _startReached: true,
            });
          } else {
            this.set('_startReached', false);
          }
        })
        .catch(error => {
          this.trigger('fetchPrevRejected');
          throw error;
        })
        .then(result => {
          this.trigger('fetchPrevResolved');
          return result;
        })
        .finally(() => safeExec(this, 'set', '_fetchPrevLock', false));
    } else {
      return resolve();
    }
  },

  fetchNext() {
    const {
      sourceArray,
      chunkSize,
    } = this.getProperties('sourceArray', 'chunkSize');

    const fetchSize = chunkSize;
    if (!fetchSize) {
      return resolve();
    }

    if (!this.get('_fetchNextLock')) {
      this.set('_fetchNextLock', true);

      const lastItem = sourceArray[get(sourceArray, 'length') - 1];

      const fetchStartIndex = lastItem ? this.getIndex(lastItem) : null;
      const duplicateCount = this.countEndDuplicates(sourceArray);
      const fetchSize = chunkSize;

      this.trigger('fetchNextStarted');
      return this.get('fetch')(
          // TODO: something is broken, because sourceArray.get('lastObject') gets wrong element
          // and items are converted from plain objects to EmberObjects
          // the workaround is to use []
          fetchStartIndex,
          fetchSize,
          (lastItem ? 1 : 0) + duplicateCount,
          this
        )
        .then(array => {
          if (get(array, 'length') < chunkSize) {
            safeExec(this, 'set', '_endReached', true);
          }
          sourceArray.push(...array);
          sourceArray.arrayContentDidChange();
        })
        .catch(error => {
          this.trigger('fetchNextRejected');
          throw error;
        })
        .then(() => {
          this.trigger('fetchNextResolved');
        })
        .finally(() => safeExec(this, 'set', '_fetchNextLock', false));
    } else {
      return resolve();
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
      fetch,
    } = this.getProperties(
      '_start',
      '_end',
      'startIndex',
      'endIndex',
      'sourceArray',
      'indexMargin',
      'fetch',
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
    let fetchStartIndex = firstObject && this.getIndex(firstObject);
    if (fetchStartIndex === undefined || head || _start === 0) {
      fetchStartIndex = null;
    }

    return fetch(
        fetchStartIndex,
        size,
        offset,
        this,
      ).then(updatedRecordsArray => {
        const fetchedCount = get(updatedRecordsArray, 'length');
        const updatedEnd = _start + fetchedCount;
        safeExec(this, 'setProperties', {
          _startReached: false,
          _endReached: false,
          error: undefined,
        });
        this.setEmptyIndex(_start - 1);
        if (updatedEnd < get(sourceArray, 'length')) {
          set(sourceArray, 'length', updatedEnd);
        }
        const updateBoundary = Math.min(updatedEnd, fetchedCount);
        for (let i = 0; i < updateBoundary; ++i) {
          sourceArray[i + _start] = updatedRecordsArray[i];
        }
        sourceArray.arrayContentDidChange(_start);
        return this;
      })
      .catch(error => {
        safeExec(this, 'set', 'error', error);
        throw error;
      })
      .finally(() => safeExec(this, 'set', '_isReloading', false));
  },

  jump(index, size = 50, offset = 0) {
    const {
      fetch,
      sourceArray,
      indexMargin,
    } = this.getProperties('fetch', 'sourceArray', 'indexMargin');
    return fetch(
      index,
      size + indexMargin * 2,
      offset - indexMargin,
      this
    ).then(array => {
      // clear array without notify
      sourceArray.splice(0, get(sourceArray, 'length'));
      sourceArray.push(...array);
      const startIndex = array.findIndex(item =>
        get(item, 'index') === index
      );
      if (startIndex === -1) {
        return false;
      } else {
        const endIndex = Math.max(
          startIndex + size + indexMargin,
          array.length
        );
        this.setProperties({
          _startReached: false,
          _endReached: false,
          startIndex,
          endIndex,
          emptyIndex: -1,
        });
        sourceArray.arrayContentDidChange();
        return this;
      }
    });
  },

  setEmptyIndex(index) {
    const sourceArray = this.get('sourceArray');
    for (let i = 0; i <= index; ++i) {
      sourceArray[i] = emptyItem;
    }
    this.set('emptyIndex', index);
  },

  init() {
    if (!this.get('sourceArray')) {
      this.set('sourceArray', A());
    }
    const fetch = this.get('fetch');
    this.set('fetch', function () {
      console.log('fetch invoked with: ', ...arguments);
      return fetch(...arguments);
    });
    this._super(...arguments);
    const initialJumpIndex = this.get('initialJumpIndex');
    const initialLoad = promiseObject(
      initialJumpIndex ?
      this.jump(this.get('initialJumpIndex')) :
      this.reload({ head: true }).then(() => {
        this.set('_startReached', this.get('_start') === 0);
        return this.startEndChanged();
      })
    );
    this.set('initialLoad', initialLoad).catch(error => {
      console.debug(
        'replacing-chunks-array#init: initial load failed: ' +
        JSON.stringify(error)
      );
      safeExec(this, 'set', 'error', error);
    });
  },
});
