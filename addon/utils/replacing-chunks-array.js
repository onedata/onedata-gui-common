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
import { A, isArray } from '@ember/array';
import _ from 'lodash';
import { resolve, all as allFulfilled } from 'rsvp';
import Evented from '@ember/object/evented';

export const emptyItem = {};

export default ArraySlice.extend(Evented, {
  /**
   * Should not be used directly internally. Instead use `fetchWrapper`.
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
  chunkSize: 24,

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
    function endChanged() {
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

  /**
   * @returns {{ arrayUpdate: Array, endReached: Boolean }}
   */
  fetchWrapper(index, size, offset) {
    const effOffset = (index == null && (!offset || offset < 0)) ? 0 : offset;
    return this.get('fetch')(index, size, effOffset, this).then(result =>
      this.handleFetchDataFetchResult(result)
    );
  },

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
    } = this.getProperties(
      '_startReached',
      'sourceArray',
      'chunkSize',
      'emptyIndex',
    );

    const firstItem = sourceArray[emptyIndex + 1];
    const fetchStartIndex = firstItem ? this.getIndex(firstItem) : null;

    const currentChunkSize = _startReached ?
      Math.min(emptyIndex + 1, chunkSize) : chunkSize;

    if (!currentChunkSize) {
      return resolve(false);
    }

    if (!this.get('_fetchPrevLock')) {
      this.set('_fetchPrevLock', true);

      this.trigger('fetchPrevStarted');
      return this.fetchWrapper(
          fetchStartIndex,
          currentChunkSize,
          -currentChunkSize,
        )
        .then(({ arrayUpdate }) => {
          // TODO: use of pullAllBy is working, but it is probably unsafe
          // it can remove items from update, while they should stay there
          // because some entries "fallen down" from further part of array
          // it should be tested
          this.removeDuplicateRecords(arrayUpdate, sourceArray);
          const fetchedArraySize = get(arrayUpdate, 'length');
          let insertIndex = emptyIndex + 1 - fetchedArraySize;
          if (fetchedArraySize) {
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
        .finally(() => {
          safeExec(this, () => {
            this.set('_fetchPrevLock', false);
            this.notifyPropertyChange('[]');
          });
        });
    } else {
      return resolve(false);
    }
  },

  fetchNext() {
    const {
      sourceArray,
      chunkSize,
    } = this.getProperties('sourceArray', 'chunkSize');

    const fetchSize = chunkSize;
    if (!fetchSize) {
      return resolve(false);
    }

    if (!this.get('_fetchNextLock')) {
      this.set('_fetchNextLock', true);

      const sourceArrayLength = get(sourceArray, 'length');
      const lastItem = sourceArray[sourceArrayLength - 1];
      const fetchStartIndex = lastItem ? this.getIndex(lastItem) : null;
      const duplicateCount = this.countEndDuplicates(sourceArray);
      const fetchSize = chunkSize;

      this.trigger('fetchNextStarted');
      return this.fetchWrapper(
          // TODO: something is broken, because sourceArray.get('lastObject') gets wrong element
          // and items are converted from plain objects to EmberObjects
          // the workaround is to use []
          fetchStartIndex,
          fetchSize,
          (lastItem ? 1 : 0) + duplicateCount,
        )
        .then(({ arrayUpdate, endReached }) => {
          // after asynchronous fetch, other fetch could modify array, so we need to
          // ensure that pulled data does not already contain new records
          this.removeDuplicateRecords(arrayUpdate, sourceArray);
          if (endReached === undefined) {
            endReached = get(arrayUpdate, 'length') < chunkSize;
          }
          if (endReached) {
            safeExec(this, 'set', '_endReached', true);
          }
          sourceArray.push(...arrayUpdate);
          sourceArray.arrayContentDidChange();
        })
        .catch(error => {
          this.trigger('fetchNextRejected');
          throw error;
        })
        .then(() => {
          this.trigger('fetchNextResolved');
        })
        .finally(() => {
          safeExec(this, () => {
            this.set('_fetchNextLock', false);
            this.notifyPropertyChange('[]');
          });
        });
    } else {
      return resolve(false);
    }
  },

  reload({ head = false, minSize = this.get('chunkSize'), offset = 0 } = {}) {
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
    let fetchStartIndex = firstObject && this.getIndex(firstObject);
    if (fetchStartIndex === undefined || head || _start === 0) {
      fetchStartIndex = null;
    }

    return this.fetchWrapper(
        fetchStartIndex,
        size,
        offset,
      )
      .then(({ arrayUpdate }) => {
        const fetchedCount = get(arrayUpdate, 'length');
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
          sourceArray[i + _start] = arrayUpdate[i];
        }
        sourceArray.arrayContentDidChange(_start);
        return this;
      })
      .catch(error => {
        safeExec(this, 'set', 'error', error);
        throw error;
      })
      .finally(() => {
        safeExec(this, () => {
          this.set('_isReloading', false);
          this.notifyPropertyChange('[]');
        });
      });
  },

  jump(index, size = 50) {
    const {
      sourceArray,
      indexMargin,
    } = this.getProperties('sourceArray', 'indexMargin');
    return this.fetchWrapper(
        index,
        size + indexMargin * 2,
        -indexMargin,
      )
      .then(({ arrayUpdate }) => {
        // clear array without notify
        sourceArray.splice(0, get(sourceArray, 'length'));
        sourceArray.push(...arrayUpdate);
        const startIndex = arrayUpdate.findIndex(item =>
          get(item, 'index') === index
        );
        if (startIndex === -1) {
          return false;
        } else {
          const endIndex = Math.min(
            startIndex + size,
            arrayUpdate.length
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

  /**
   * @param {Array|Object} fetchResult can be:
   *   - array with items from requested chunk; chunk in next pocessing steps should be
   *     considered as last if there are less new elements than requested
   *   - object with: `array: Array`, `isLast: boolean` - array is the same as array-only
   *     parameter, but chunk shoud be considered as last if the `isLast` flag is true
   *   - if the result is not an array nor object, then chunk is considered as empty
   *     and as last
   * @returns {{ arrayUpdate: Array, endReached: Boolean }}
   */
  handleFetchDataFetchResult(fetchResult) {
    let arrayUpdate;
    let endReached;
    if (isArray(fetchResult)) {
      arrayUpdate = fetchResult;
    } else if (typeof fetchResult === 'object') {
      arrayUpdate = fetchResult.array;
      endReached = fetchResult.isLast;
    } else {
      console.error(
        'util:replacing-chunks-array#handleFetchDataFetchResult: invalid data from fetch'
      );
      console.dir(fetchResult);
      arrayUpdate = [];
      endReached = true;
    }
    return {
      arrayUpdate,
      endReached,
    };
  },

  init() {
    if (!this.get('sourceArray')) {
      this.set('sourceArray', A());
    }
    this._super(...arguments);
    const initialJumpIndex = this.get('initialJumpIndex');
    const initialLoad = promiseObject(
      initialJumpIndex ?
      this.jump(initialJumpIndex) :
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

  removeDuplicateRecords(arrayUpdateData, sourceArray) {
    _.pullAllWith(
      arrayUpdateData,
      sourceArray,
      (a, b) => (a && get(a, 'id')) === (b && get(b, 'id'))
    );
  },
});
