/**
 * Array that fetches additional chunks of data if requesting indices
 * that are not currently loaded
 *
 * @module utils/replacing-chunks-array
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ArraySlice from 'onedata-gui-common/utils/array-slice';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { get, set, computed, observer } from '@ember/object';
import { A } from '@ember/array';
import _ from 'lodash';
import { resolve } from 'rsvp';
import Evented from '@ember/object/evented';

export const emptyItem = {};

export default ArraySlice.extend(Evented, {
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
    'emptyIndex',
    function startEndChanged() {
      if (!this.get('isReloading')) {
        const {
          _start,
          _end,
          _startReached,
          _endReached,
          loadMoreThreshold,
          sourceArray,
          emptyIndex,
        } = this.getProperties(
          '_start',
          '_end',
          '_startReached',
          '_endReached',
          'loadMoreThreshold',
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
      const fetchStartIndex = firstItem ? get(firstItem, 'index') : null;

      const currentChunkSize = _startReached ?
        Math.min(emptyIndex + 1, chunkSize) : chunkSize;

      this.trigger('fetchPrevStarted');
      return this.get('fetch')(
          fetchStartIndex,
          currentChunkSize,
          -currentChunkSize
        )
        .then(arrayUpdate => {
          // TODO: use of pullAllBy is working, but it is probably unsafe
          // it can remove items from update, while they should stay there
          // because some entries "fallen down" from further part of array
          // it should be tested
          _.pullAllBy(arrayUpdate, sourceArray, 'id');
          const fetchedArraySize = get(arrayUpdate, 'length')
          let insertIndex = emptyIndex + 1 - fetchedArraySize;
          // fetched data without duplicated is less than requested,
          // so there is nothing left on the array start
          if (fetchedArraySize >= currentChunkSize) {
            if (fetchedArraySize < currentChunkSize && insertIndex > 0) {
              for (let i = 0; i < insertIndex; ++i) {
                sourceArray.shift();
              }
            }
            if (insertIndex >= 0) {
              // add new entries on the front and set new insertIndex for further use
              for (let i = 0; i < fetchedArraySize; ++i) {
                sourceArray[i + insertIndex] = arrayUpdate[i];
              }
              safeExec(this, 'set', 'emptyIndex', insertIndex - 1);
              sourceArray.arrayContentDidChange();
            } else {
              // there is more data on the array start, so we must move all the data
              sourceArray.unshift(
                _.times(
                  fetchedArraySize - emptyIndex - 1,
                  _.constant(emptyItem)
                )
              );
              insertIndex = 0;
            }
          } else {
            // there is equal or more items available on the start of array,
            // so let's just reload the front and invalidate everything else!
            for (let i = 0; i < insertIndex; ++i) {
              sourceArray.shift();
            }
            this.setProperties({
              startIndex: 0,
            })
            return this.reload();
          }
        })
        .catch(error => {
          this.trigger('fetchPrevRejected')
          throw error;
        })
        .then(result => {
          this.trigger('fetchPrevResolved');
          return result
        })
        .finally(() => safeExec(this, 'set', '_fetchPrevLock', false));
    } else {
      return resolve();
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
      const fetchStartIndex = lastItem ? get(lastItem, 'index') : null;

      this.trigger('fetchNextStarted');
      return this.get('fetch')(
          // TODO: something is broken, because sourceArray.get('lastObject') gets wrong element
          // and items are converted from plain objects to EmberObjects
          // the workaround is to use []
          fetchStartIndex,
          fetchSize,
          lastItem ? 1 : 0
        )
        .then(array => {
          if (get(array, 'length') < chunkSize) {
            safeExec(this, 'set', '_endReached', true);
          }
          sourceArray.push(...array);
          sourceArray.arrayContentDidChange();
        })
        .catch(error => {
          this.trigger('fetchNextRejected')
          throw error;
        })
        .then(result => {
          this.trigger('fetchNextResolved');
          return result
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
    let fetchStartIndex = firstObject && get(firstObject, 'index');
    if (fetchStartIndex === undefined || head || _start === 0) {
      fetchStartIndex = null;
    }

    return this.get('fetch')(
        fetchStartIndex,
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
        const updateBoundary = Math.min(updatedEnd, fetchedCount);
        for (let i = 0; i < updateBoundary; ++i) {
          sourceArray[i + _start] = updatedRecordsArray[i];
        }
        sourceArray.arrayContentDidChange(_start, );
        return this;
      })
      .catch(error => {
        safeExec(this, 'set', 'error', error);
        throw error;
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
    ).catch(error => {
      console.debug('replacing-chunks-array#init: initial load failed: ' + error);
    });
  },
});
