/**
 * Array that fetches additional chunks of data if requesting indices
 * that are not currently loaded
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ArraySlice from 'onedata-gui-common/utils/array-slice';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { get, set, computed } from '@ember/object';
import { reads, not } from '@ember/object/computed';
import { A, isArray } from '@ember/array';
import _ from 'lodash';
import {
  resolve,
  all as allFulfilled,
  allSettled,
} from 'rsvp';
import Evented from '@ember/object/evented';
import OneSingletonTaskQueue from 'onedata-gui-common/utils/one-singleton-task-queue';
import { syncObserver } from 'onedata-gui-common/utils/observer';

export const emptyItem = {};

/**
 * @typedef {Object} ChunksFetchResult
 * @property {Array} array
 * @property {boolean} isLast
 */

/**
 * @typedef {(index, size, offset) => ChunksFetchResult} ChunksFetchFunction
 */

export default ArraySlice.extend(Evented, {
  /**
   * Should not be used directly internally. Instead use `fetchWrapper`.
   * @virtual
   * @type {ChunksFetchFunction}
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
   * @type {number}
   */
  customLoadMoreThreshold: undefined,

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
   * @type {number}
   */
  chunkSize: 24,

  /**
   * Size of fetch used when the jump is done.
   * @type {number}
   */
  jumpChunkSize: 50,

  /**
   * Minimum size of query when doing reload. It it set to the `chunksSize` by default
   * if not specified.
   * @type {number}
   */
  reloadMinSize: undefined,

  loadMoreThreshold: computed('chunkSize', 'customLoadMoreThreshold', {
    get() {
      return this.customLoadMoreThreshold ?? (this.chunkSize / 2);
    },
    set(key, value) {
      return this.set('customLoadMoreThreshold', value);
    },
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
   * @type {Utils.OneSingletonTaskQueue}
   */
  taskQueue: undefined,

  /**
   * Set to true if reloading is in progress
   * @type {boolean}
   */
  _isReloading: false,

  startEndChanged() {
    return allFulfilled([this.startChanged(), this.endChanged()]);
  },

  isFetchPrevNeeded() {
    return !this.sourceArray.length ||
      !this._startReached && this._start - this.loadMoreThreshold <= this.emptyIndex;
  },

  isFetchNextNeeded() {
    return !this.isReloading && !this._endReached &&
      this._end + this.loadMoreThreshold >= this.sourceArray.length;
  },

  /**
   * Sync observer: schedule task adds the fetch opearation to the queue.
   */
  startChanged: syncObserver(
    '_start',
    '_startReached',
    'loadMoreThreshold',
    'sourceArray.[]',
    'emptyIndex',
    function startChanged() {
      if (this.isFetchPrevNeeded()) {
        return this.scheduleTask('fetchPrev');
      }
    }
  ),

  /**
   * Sync observer: schedule task adds the fetch opearation to the queue.
   */
  endChanged: syncObserver(
    '_end',
    '_endReached',
    'loadMoreThreshold',
    'sourceArray.[]',
    function endChanged() {
      if (this.isFetchNextNeeded()) {
        return this.scheduleTask('fetchNext');
      }
    }
  ),

  /**
   * Returns true, if `fetchPrev` and `fetchNext` (async methods expanding array)
   * should not be scheduled.
   * @returns {Boolean}
   */
  isFetchExpandLocked() {
    const taskQueue = this.get('taskQueue');
    const blockingTask = taskQueue.queue.find(task => {
      return /^(reload|jump)/.test(task.type);
    });
    return Boolean(blockingTask);
  },

  /**
   * @param {string} taskName Same as in `OneSingletonTaskQueue.scheduleTask`.
   * @param {Object} options Additional options.
   * @param {boolean} options.ignoreCurrentTask Passed to queue's `scheduleTask`, same as
   *   in `OneSingletonTaskQueueScheduleOptions`.
   * @param {string} methodName Method to invoke in `ReplacingChunksArray`.
   * @param {...any} args Arguments for method invoked in `ReplacingChunksArray`.
   * @returns {Promise} Promise as in `OneSingletonTaskQueue.scheduleTask` after
   *   scheduling the task.
   */
  async scheduleTask(taskName, options, methodName = taskName, ...args) {
    if (
      (taskName === 'fetchPrev' || taskName === 'fetchNext') &&
      this.isFetchExpandLocked()
    ) {
      console.debug('util:replacing-chunks-array: cancelled scheduling', taskName);
      return false;
    }

    const taskQueueOptions = {};
    let taskFun;
    if (taskName === 'fetchPrev') {
      // For fetch prev: schedule check if user did scroll to region that is still not
      // loaded - if so, we need to schedule next fetchPrev.
      // We need to do this, because auto-fetchPrev scheduling is locked when fetchPrev
      // is in progress (when user performs scroll and loading is in progress).
      taskFun = async () => {
        let prevSourceArrayLength;
        while (this.isFetchPrevNeeded() && !this.isDestroyed && !this.isDestroying) {
          await this[methodName](...args);
          if (this.sourceArray.length === 0) {
            break;
          }
          if (this.sourceArray.length === prevSourceArrayLength) {
            console.error(
              'ReplacingChunksArray: possible infinite fetchPrev loop detected'
            );
            break;
          }
          prevSourceArrayLength = this.sourceArray.length;
        }
      };
    } else {
      taskFun = () => this[methodName](...args);
    }
    if (options?.ignoreCurrentTask) {
      taskQueueOptions.ignoreCurrentTask = options.ignoreCurrentTask;
    }
    return await this.taskQueue.scheduleTask(
      taskName,
      taskFun,
      taskQueueOptions
    );
  },

  /**
   * Uses raw fetch method to achieve unified-formatted results. Can invoke fetch multiple
   * times if single fetch result doesn't resolve needed amount of items and backend does
   * not report list end.
   * @returns {Promise<{ arrayUpdate: Array, endReached: boolean }>}
   */
  async fetchWrapper(index, size, offset) {
    let effIndex = index;
    let effOffset = (effIndex == null && !(offset > 0)) ? 0 : offset;
    const totalArrayUpdate = [];
    let totalEndReached = false;
    while (!totalEndReached && totalArrayUpdate.length < size) {
      const result = await this.fetch(effIndex, size, effOffset, this);
      const { arrayUpdate, endReached } = this.handleFetchDataFetchResult(result, size);
      if (this.isDestroyed || this.isDestroying) {
        return {
          arrayUpdate: totalArrayUpdate,
          endReached: totalEndReached,
        };
      }
      if (!arrayUpdate?.length) {
        totalEndReached = true;
      } else {
        effIndex = this.getIndex(_.last(arrayUpdate));
        effOffset = 1;
        totalArrayUpdate.push(...arrayUpdate);
        totalEndReached = endReached;
      }
    }
    return {
      arrayUpdate: totalArrayUpdate,
      endReached: totalEndReached,
    };
  },

  getIndex(record) {
    return get(record, 'index');
  },

  /**
   * Expand array's beginning using data retrieved with fetch.
   * This method should be not used directly - instead use `scheduleTask('fetchPrev')`
   * to prevent issues with async array modification.
   * @returns {Promise}
   */
  fetchPrev() {
    const {
      _startReached,
      sourceArray,
      chunkSize,
      emptyIndex,
    } = this;

    const firstItem = sourceArray[emptyIndex + 1];
    const fetchStartIndex = firstItem ? this.getIndex(firstItem) : null;

    const currentChunkSize = _startReached ?
      Math.min(emptyIndex + 1, chunkSize) : chunkSize;

    if (!currentChunkSize) {
      return resolve(false);
    }

    this.trigger('fetchPrevStarted');

    const updatePromise = (async () => {
      try {
        const { arrayUpdate } = await this.fetchWrapper(
          fetchStartIndex,
          currentChunkSize,
          -currentChunkSize,
        );
        if (this.isDestroyed) {
          return;
        }
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
            this.setEmptyIndex(insertIndex - 1);
            sourceArray.arrayContentDidChange();
          } else {
            // there is more data on the array start, so we must make additional space
            const additionalFrontSpace = fetchedArraySize - emptyIndex - 1;
            this.trigger(
              'willChangeArrayBeginning', {
                updatePromise,
                newItemsCount: additionalFrontSpace,
              }
            );
            sourceArray.unshift(..._.times(
              additionalFrontSpace,
              _.constant(emptyItem)
            ));
            // insert index is now sourceArray beginning, add new entries
            insertIndex = 0;
            for (let i = insertIndex; i < fetchedArraySize; ++i) {
              sourceArray[i] = arrayUpdate[i];
            }
            const newStartIndex = this.startIndex + additionalFrontSpace;
            const newEndIndex = this.endIndex + additionalFrontSpace;
            this.setProperties({
              startIndex: newStartIndex,
              endIndex: newEndIndex,
              emptyIndex: -1,
            });
          }
        }
        // fetched data without duplicated is less than requested,
        // so there is nothing left on the array start
        if (fetchedArraySize < currentChunkSize) {
          for (let i = 0; i < insertIndex; ++i) {
            sourceArray.shift();
          }
          const newStartIndex = this.startIndex - insertIndex;
          const newEndIndex = this.endIndex - insertIndex;
          this.setProperties({
            startIndex: newStartIndex,
            endIndex: newEndIndex,
            _startReached: true,
          });
        } else {
          this.set('_startReached', false);
        }
        this.trigger('fetchPrevResolved');
      } catch (error) {
        this.trigger('fetchPrevRejected');
        throw error;
      } finally {
        safeExec(this, () => {
          this.notifyPropertyChange('[]');
        });
      }
    })();
    return updatePromise;
  },

  /**
   * Expand array's end using data retrieved with fetch method.
   * This method should be not used directly - instead use `scheduleTask('fetchNext')`
   * to prevent issues with async array modification.
   * @returns {Promise}
   */
  fetchNext() {
    const {
      sourceArray,
      chunkSize,
    } = this.getProperties('sourceArray', 'chunkSize');

    const fetchSize = chunkSize;
    if (!fetchSize) {
      return resolve(false);
    }

    const sourceArrayLength = get(sourceArray, 'length');
    const lastItem = sourceArray[sourceArrayLength - 1];
    const fetchStartIndex = lastItem ? this.getIndex(lastItem) : null;

    this.trigger('fetchNextStarted');
    return this.fetchWrapper(
        // TODO: something is broken, because sourceArray.get('lastObject') gets wrong element
        // and items are converted from plain objects to EmberObjects
        // the workaround is to use []
        fetchStartIndex,
        fetchSize,
        (lastItem ? 1 : 0),
      )
      .then(({ arrayUpdate, endReached }) => {
        if (this.isDestroyed) {
          return;
        }
        if (endReached ?? get(arrayUpdate, 'length') < chunkSize) {
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
          this.notifyPropertyChange('[]');
        });
      });
  },

  /**
   * Reload current array view or load array from beginning (`head === true`). This method
   * should be not used directly - instead use `scheduleReload(...)` to prevent issues
   * with async array modification.
   * @param {Object} [options]
   * @param {boolean} options.head If true, reload will be performed from the beginning of
   *   the data source (index will be set to null).
   * @param {InfiniteScrollSize} options.minSize Minimum size of queried items. The actual
   *   query size could be larger and it's based on computed reload start/end.
   * @param {InfiniteScrollOffset} options.offset
   * @returns {Promise}
   */
  async _reload({ head = false, minSize = this.reloadMinSize, offset = 0 } = {}) {
    const {
      _start,
      _end,
      startIndex,
      endIndex,
      sourceArray,
      indexMargin,
    } = this;

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
    let fetchStartIndex;
    if (!head) {
      fetchStartIndex = firstObject && this.getIndex(firstObject);
    }
    const isEffHead = (
      head ||
      fetchStartIndex === undefined ||
      (_start === 0 && !this.isFetchPrevNeeded())
    );
    if (isEffHead) {
      fetchStartIndex = null;
    }

    const endIndexBeforeFetch = this.endIndex;

    let effStartReached = isEffHead;
    try {
      let { arrayUpdate, endReached } = await this.fetchWrapper(
        fetchStartIndex,
        size,
        offset,
      );
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      const fetchedCount = get(arrayUpdate, 'length');
      const updatedEnd = _start + fetchedCount;
      if (!isEffHead && !fetchedCount) {
        const backwardResponse = (await this.fetchWrapper(
          // The backend makes sorting based on ASCII chars (single byte), so instead
          // using the highest possible Unicode char (\u10FFFF) we send query with four
          // highest bytes (the highest Unicode char has 0x10h first byte).
          '\uFFFF\uFFFF',
          size,
          -size,
        ));
        if (this.isDestroyed || this.isDestroying) {
          return;
        }
        arrayUpdate = backwardResponse.arrayUpdate;
        endReached = backwardResponse.endReached;
        effStartReached = backwardResponse.arrayUpdate.length < size;
      }
      this.setProperties({
        _startReached: effStartReached,
        _endReached: Boolean(endReached),
        error: undefined,
      });
      if (isEffHead || !fetchedCount) {
        // clear array without notify
        sourceArray.splice(0, get(sourceArray, 'length'));
        sourceArray.push(...arrayUpdate);
        this.setProperties({
          emptyIndex: -1,
          startIndex: 0,
          endIndex: endIndexBeforeFetch <= 0 ?
            fetchedCount : Math.min(endIndexBeforeFetch, fetchedCount),
        });
      } else {
        const updateBoundary = Math.min(updatedEnd, fetchedCount);
        for (let i = 0; i < updateBoundary; ++i) {
          sourceArray[i + _start] = arrayUpdate[i];
        }
        this.setEmptyIndex(_start - 1);
        if (updatedEnd < get(sourceArray, 'length')) {
          set(sourceArray, 'length', updatedEnd);
        }
        if (this.startIndex === this.endIndex) {
          this.setProperties({
            startIndex: 0,
            endIndex: sourceArray.length,
          });
        }
      }
      sourceArray.arrayContentDidChange(_start);
      return this;
    } catch (error) {
      safeExec(this, 'set', 'error', error);
      throw error;
    } finally {
      safeExec(this, () => {
        this.set('_isReloading', false);
        this.notifyPropertyChange('[]');
      });
    }
  },

  scheduleReload({ head, minSize, offset, forced } = {}) {
    return this.scheduleTask(
      `reload-${head}-${minSize}-${offset}`, { ignoreCurrentTask: forced },
      '_reload', { head, minSize, offset }
    );
  },

  /**
   * Change current array view using `index` of item desired to be viewed in new view.
   * This method should be not used directly - instead use `scheduleJump(...)`
   * to prevent issues with async array modification.
   * Resolves to `false` if fetched array update does not contain record with requested
   * index.
   * @returns {Promise}
   */
  _jump(index, size = this.jumpChunkSize) {
    const {
      sourceArray,
      indexMargin,
    } = this;
    const updatePromise = (async () => {
      const { arrayUpdate, endReached } = await this.fetchWrapper(
        index,
        size + indexMargin * 2,
        -indexMargin,
      );
      if (this.isDestroyed) {
        return;
      }
      // clear array without notify
      sourceArray.splice(0, get(sourceArray, 'length'));
      sourceArray.push(...arrayUpdate);
      // Empty index means a jump to the beginning
      const startIndex = index ? arrayUpdate.findIndex(item =>
        get(item, 'index') === index
      ) : 0;
      if (startIndex === -1) {
        return false;
      } else {
        const endIndex = Math.min(
          startIndex + size,
          arrayUpdate.length
        );
        this.setProperties({
          _startReached: startIndex < indexMargin,
          _endReached: Boolean(endReached),
          startIndex,
          endIndex,
          emptyIndex: -1,
        });
        sourceArray.arrayContentDidChange();
        return this;
      }
    })();
    this.trigger('willResetArray', {
      updatePromise,
    });
    return updatePromise;
  },

  scheduleJump(index, size) {
    return this.scheduleTask(
      `jump-${index}-${size}`, {},
      '_jump',
      index,
      size
    );
  },

  setEmptyIndex(index) {
    if (this.isDestroyed) {
      return;
    }
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
   * @param {number} targetSize
   * @returns {Promise<{ arrayUpdate: Array, endReached: boolean }>}
   */
  handleFetchDataFetchResult(fetchResult, targetSize) {
    let arrayUpdate;
    let endReached;
    if (isArray(fetchResult)) {
      arrayUpdate = fetchResult;
      endReached = typeof targetSize === 'number' ?
        arrayUpdate.length < targetSize : true;
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

  /**
   * Returns a promise that resolves when currently scheduled fetchPrev and fetchNext
   * tasks settle. When there are no prev or next operations pending, returns empty
   * resolving promise.
   * @returns {Promise}
   */
  async getCurrentExpandPromise() {
    const taskQueue = this.get('taskQueue');
    const promises = [
      taskQueue.getTaskPromise('fetchPrev'),
      taskQueue.getTaskPromise('fetchNext'),
    ];
    return allSettled(promises);
  },

  setIndices(startIndex, endIndex) {
    const changes = {};
    if (startIndex !== this.startIndex) {
      changes.startIndex = startIndex;
    }
    if (endIndex !== this.endIndex) {
      changes.endIndex = endIndex;
    }
    if (!Object.keys(changes).length) {
      // nothing to do
      return;
    }
    this.setProperties(changes);
  },

  init() {
    if (typeof this.reloadMinSize !== 'number') {
      this.set('reloadMinSize', this.chunkSize);
    }
    if (!this.sourceArray) {
      this.set('sourceArray', A());
    }
    if (!this.taskQueue) {
      this.set('taskQueue', new OneSingletonTaskQueue());
    }
    this._super(...arguments);
    const initialJumpIndex = this.initialJumpIndex;

    const initialLoad = promiseObject((async () => {
      const loadPromise = initialJumpIndex ?
        this.scheduleJump(initialJumpIndex) :
        this.scheduleReload({ head: true }).then(() => {
          // do not wait for initialLoad resolve for async start/end hooks
          this.startEndChanged();
        });
      try {
        return await loadPromise;
      } catch (error) {
        console.debug(
          'util:replacing-chunks-array#init: initial load failed: ' +
          JSON.stringify(error)
        );
        safeExec(this, 'set', 'error', error);
        throw error;
      }
    })());
    this.set('initialLoad', initialLoad);
  },

  removeDuplicateRecords(arrayUpdateData, sourceArray) {
    _.pullAllWith(
      arrayUpdateData,
      sourceArray,
      (a, b) => (a && get(a, 'id')) === (b && get(b, 'id'))
    );
  },
});
