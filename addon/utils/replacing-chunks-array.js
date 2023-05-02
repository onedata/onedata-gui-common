// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */
/* eslint-disable jsdoc/require-returns */

/**
 * Array that fetches additional chunks of data if requesting indices
 * that are not currently loaded
 *
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
import {
  resolve,
  all as allFulfilled,
  allSettled,
} from 'rsvp';
import Evented from '@ember/object/evented';
import OneSingletonTaskQueue from 'onedata-gui-common/utils/one-singleton-task-queue';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

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
    return !get(this.sourceArray, 'length') ||
      !this._startReached && this._start - this.loadMoreThreshold <= this.emptyIndex;
  },

  startChanged: observer(
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

  endChanged: observer(
    '_end',
    '_endReached',
    'loadMoreThreshold',
    'sourceArray.[]',
    function endChanged() {
      if (
        !this.isReloading &&
        !this._endReached &&
        this._end + this.loadMoreThreshold >= this.sourceArray.length
      ) {
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

  async scheduleTask(taskName, methodName = taskName, ...args) {
    if (
      (taskName === 'fetchPrev' || taskName === 'fetchNext') &&
      this.isFetchExpandLocked()
    ) {
      console.debug('util:replacing-chunks-array: cancelled scheduling', taskName);
      return false;
    }
    const fun = () => this[methodName](...args);
    let taskFun = fun;
    let options = {};
    if (taskName === 'fetchPrev') {
      options = { insertBeforeType: 'reload' };
      // For fetch prev: schedule check if user did scroll to region that is still not
      // loaded - if so, we need to schedule next fetchPrev.
      // We need to do this, because auto-fetchPrev scheduling is locked when fetchPrev
      // is in progress (when user performs scroll and loading is in progress).
      taskFun = () => fun().then(async (result) => {
        await waitForRender();
        if (this.isFetchPrevNeeded()) {
          console.debug('util:replacing-chunks-array: next serial fetchPrev needed');
          this.taskQueue.forceScheduleTask('fetchPrev', () => this.fetchPrev(), options);
        }
        return result;
      });
    }
    return await this.taskQueue.scheduleTask(
      taskName,
      taskFun,
      options
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
        effIndex = get(_.last(arrayUpdate), 'index');
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

    this.trigger('fetchPrevStarted');
    const updatePromise = this.fetchWrapper(
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
            const indexOffset = fetchedArraySize;
            this.setProperties({
              startIndex: this.get('startIndex') + indexOffset,
              endIndex: this.get('endIndex') + indexOffset,
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
          this.notifyPropertyChange('[]');
        });
      });
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
          this.notifyPropertyChange('[]');
        });
      });
  },

  /**
   * Reload current array view or load array from beginning (`head === true`).
   * This method should be not used directly - instead use `scheduleReload(...)`
   * to prevent issues with async array modification.
   * @returns {Promise}
   */
  async _reload({ head = false, minSize = this.chunkSize, offset = 0 } = {}) {
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

    const lengthBeforeFetch = this.length || (this.endIndex - this.startIndex);

    try {
      const { arrayUpdate, endReached } = await this.fetchWrapper(
        fetchStartIndex,
        size,
        offset,
      );
      const fetchedCount = get(arrayUpdate, 'length');
      const updatedEnd = _start + fetchedCount;
      safeExec(this, 'setProperties', {
        _startReached: Boolean(head),
        _endReached: Boolean(endReached),
        error: undefined,
      });
      if (head) {
        // clear array without notify
        sourceArray.splice(0, get(sourceArray, 'length'));
        sourceArray.push(...arrayUpdate);
        this.setProperties({
          emptyIndex: -1,
          startIndex: 0,
          endIndex: lengthBeforeFetch <= 0 ?
            fetchedCount : Math.min(lengthBeforeFetch, fetchedCount),
        });
      } else {
        this.setEmptyIndex(_start - 1);
        if (updatedEnd < get(sourceArray, 'length')) {
          set(sourceArray, 'length', updatedEnd);
        }
        const updateBoundary = Math.min(updatedEnd, fetchedCount);
        for (let i = 0; i < updateBoundary; ++i) {
          sourceArray[i + _start] = arrayUpdate[i];
        }
      }
      sourceArray.arrayContentDidChange(this._start);
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

  scheduleReload({ head, minSize, offset } = {}) {
    return this.scheduleTask(
      `reload-${head}-${minSize}-${offset}`,
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
  _jump(index, size = 50) {
    const {
      sourceArray,
      indexMargin,
    } = this.getProperties('sourceArray', 'indexMargin');
    const updatePromise = this.fetchWrapper(
        index,
        size + indexMargin * 2,
        -indexMargin,
      )
      .then(({ arrayUpdate, endReached }) => {
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
            _startReached: false,
            _endReached: Boolean(endReached),
            startIndex,
            endIndex,
            emptyIndex: -1,
          });
          sourceArray.arrayContentDidChange();
          return this;
        }
      });
    this.trigger('willResetArray', {
      updatePromise,
    });
    return updatePromise;
  },

  scheduleJump(index, size) {
    return this.scheduleTask(
      `jump-${index}-${size}`,
      '_jump',
      index,
      size
    );
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
   */
  async getCurrentExpandPromise() {
    const taskQueue = this.get('taskQueue');
    const promises = [
      taskQueue.getTaskPromise('fetchPrev'),
      taskQueue.getTaskPromise('fetchNext'),
    ];
    return allSettled(promises);
  },

  init() {
    if (!this.get('sourceArray')) {
      this.set('sourceArray', A());
    }
    if (!this.get('taskQueue')) {
      this.set('taskQueue', new OneSingletonTaskQueue());
    }
    this._super(...arguments);
    const initialJumpIndex = this.get('initialJumpIndex');
    const initialLoad = promiseObject(
      initialJumpIndex ?
      this.scheduleJump(initialJumpIndex) :
      this.scheduleReload({ head: true }).then(() => {
        return this.startEndChanged();
      })
    );
    this.set('initialLoad', initialLoad).catch(error => {
      console.debug(
        'util:replacing-chunks-array#init: initial load failed: ' +
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
