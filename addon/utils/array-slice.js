/**
 * An array proxy that exposes only selected slice of real EmberArray.
 *
 * See tests for usage examples.
 *
 * @author Jakub Liput
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { alias } from '@ember/object/computed';
import ArrayProxy from '@ember/array/proxy';
import { computed, observer, defineProperty } from '@ember/object';

export default ArrayProxy.extend({
  startIndex: 0,
  endIndex: 0,
  indexMargin: 0,

  _startCache: undefined,
  _endCache: undefined,

  sourceArray: alias('content'),

  _start: computed('startIndex', 'indexMargin', function _start() {
    return Math.max(0, this.startIndex - this.indexMargin);
  }),

  _end: computed('endIndex', 'indexMargin', 'sourceArray.length', function _end() {
    const {
      endIndex,
      indexMargin,
    } = this.getProperties(
      'endIndex',
      'indexMargin'
    );

    const sourceLength = this.get('sourceArray.length');
    return Math.max(Math.min(sourceLength, endIndex + indexMargin), 0);
  }),

  _startChanged: observer('_start', function _startChanged() {
    const {
      _startCache,
      _start,
    } = this.getProperties(
      '_startCache',
      '_start'
    );

    try {
      if (_startCache !== undefined && _start !== _startCache) {
        let removeAmt = 0;
        let addAmt = 0;
        if (_start > _startCache) {
          removeAmt = _start - _startCache;
        } else {
          addAmt = _startCache - _start;
        }
        this.arrayContentDidChange(_start, removeAmt, addAmt);
      }
    } finally {
      this.set('_startCache', _start);
    }
  }),

  _endChanged: observer('_end', function _endChanged() {
    const {
      _endCache,
      _end,
    } = this.getProperties(
      '_endCache',
      '_end'
    );
    try {
      if (_endCache !== undefined && _end !== _endCache) {
        let removeAmt = 0;
        let addAmt = 0;
        if (_end > _endCache) {
          addAmt = _end - _endCache;
        } else {
          removeAmt = _endCache - _end;
        }
        this.arrayContentDidChange(_endCache - removeAmt, removeAmt, addAmt);
      }
    } finally {
      this.set('_endCache', _end);
    }
  }),

  init() {
    this._super(...arguments);
    // TODO: VFS-9267 Implement missing array method in ArraySlice
    [
      'insertAt',
      'removeAt',
      'setObjects',
      'unshiftObject',
      'unshiftObjects',
    ].forEach(methodName => {
      this.overrideAsNotImplemented(methodName);
    });
    this.defineLengthProperty();
    // activate observers
    this.getProperties('_start', '_end');
    this._startChanged();
    this._endChanged();
  },

  /**
   * Will push object to the end of sourceArray, no matter if current slice spans across
   * the end of sourceArray.
   * @override
   */
  pushObject(obj) {
    return this.get('sourceArray').pushObject(obj);
  },

  /**
   * Will push objects to the end of sourceArray, no matter if current slice spans across
   * the end of sourceArray.
   * @override
   */
  pushObjects(objects) {
    return this.get('sourceArray').pushObjects(objects);
  },

  /**
   * @override
   */
  slice(begin, end) {
    const {
      _start,
      _end,
      sourceArray,
    } = this.getProperties('_start', '_end', 'sourceArray');
    let effBegin = begin;
    let effEnd = end;
    if (typeof effBegin === 'number') {
      effBegin = effBegin >= 0 ?
        this._translateIndex(effBegin) :
        this._translateNegativeIndex(effBegin);
    } else {
      effBegin = _start;
    }
    if (typeof effEnd === 'number') {
      effEnd = effEnd >= 0 ?
        this._translateIndex(effEnd) :
        this._translateNegativeIndex(effEnd);
    } else {
      effEnd = _end;
    }
    return sourceArray.slice(effBegin, effEnd);
  },

  /**
   * @override
   */
  replace(idx, amt, objects) {
    const sourceArray = this.get('sourceArray');
    return sourceArray.replace(this._translateIndex(idx), amt, objects);
  },

  /**
   * @override
   */
  objectAt(idx) {
    const sourceArray = this.get('sourceArray');
    if (sourceArray) {
      return sourceArray.objectAt(this._translateIndex(idx));
    }
  },

  getLength() {
    return this._end - this._start;
  },

  defineLengthProperty() {
    defineProperty(this, 'length', computed('_start', '_end', function length() {
      return this.getLength();
    }));
  },

  _arrayContentChange(startIdx, removeAmt, addAmt, fun) {
    let result;
    if (this._start <= startIdx && startIdx <= this._end) {
      const sliceStartIdx = startIdx - this._start;
      const sliceRemoveAmt =
        Math.min(this._end, sliceStartIdx + removeAmt) - sliceStartIdx;
      const sliceAddAmt = Math.min(this._end, sliceStartIdx + addAmt) - sliceStartIdx;
      result = fun.bind(this)(sliceStartIdx, sliceRemoveAmt, sliceAddAmt);
      // A hack to notify observers of "[]" array property.
      // Needed since Ember 3.16.6 version, because of the following change:
      // https://github.com/emberjs/ember.js/pull/18835
      this.notifyPropertyChange('arrangedContent');
    } else {
      // ignore the chanage result, because it is out of slice range
      result = this;
    }
    return result;
  },

  /**
   * @override
   */
  arrayContentWillChange(startIdx, removeAmt, addAmt) {
    return this._arrayContentChange(startIdx, removeAmt, addAmt, this._super);
  },

  /**
   * @override
   */
  arrayContentDidChange(startIdx, removeAmt, addAmt) {
    return this._arrayContentChange(startIdx, removeAmt, addAmt, this._super);
  },

  _translateIndex(index) {
    const {
      _start,
      _end,
    } = this.getProperties(
      '_start',
      '_end'
    );
    const translatedIndex = _start + index;
    return translatedIndex > _end ? -1 : translatedIndex;
  },

  _translateNegativeIndex(negativeIndex) {
    const _end = this.get('_end');
    return Math.max(_end + negativeIndex, 0);
  },

  overrideAsNotImplemented(methodName) {
    this[methodName] = () => {
      throw new Error(
        `"${methodName}" method is not implemented in array-slice - you can use this method directly on arraySource if needed, considering index translations`
      );
    };
  },
});
