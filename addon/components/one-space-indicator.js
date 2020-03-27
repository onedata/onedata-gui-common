/**
 * A bar chart that shows used space according to given currentTotalSize,
 * newTotalSize and occupiedSize.
 * 
 * The valid currentTotalSize and occupied size is required to work.
 * Optionally, newTotalSize can be used to show how the space will change
 * after changing total size.
 *
 * @module components/one-space-indicator
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/one-space-indicator';
import { gt } from '@ember/object/computed';

export default Component.extend({
  layout,
  classNames: ['one-space-indicator'],
  classNameBindings: [
    '_hasWarningUsage:warning-usage',
    '_hasCriticalUsage:critical-usage',
  ],

  /**
   * @virtual
   * @type {number}
   */
  currentTotalSize: undefined,

  /**
   * @virtual optional
   * Use if want to show state of space after resize.
   * If provided, the expand/shrinking markers will be rendered
   * and the occupancy will be colored relative to the new total size.
   * @type {number|undefined}
   */
  newTotalSize: undefined,

  /**
   * @virtual
   * @type {number}
   */
  occupiedSize: undefined,

  /**
   * Controls when the expand arrow should be used - if the relative
   * difference between current and new total sizes are greater than this
   * fraction, the additional arrow should be rendered.
   * @type {number}
   */
  minShowArrowFraction: 0.09,

  /**
   * @type {string|undefined}
   */
  incorrectDataMessage: computed(
    '_isDataValid',
    'currentTotalSize',
    'occupiedSize',
    function incorrectDataMessage() {
      if (!this.get('_isDataValid')) {
        const {
          currentTotalSize,
          occupiedSize,
        } = this.getProperties(
          'currentTotalSize',
          'occupiedSize',
        );
        return `currentTotalSize: ${currentTotalSize}; occupiedSize: ${occupiedSize}`;
      }
    }
  ),

  /**
   * Total width of the bar in bytes.
   * Either a current total size or the expanded total size.
   * If the space is shrinked, we use currentTotalSize because we do not want
   * whole bar to be shrinked.
   * @type {Ember.ComputedProperty<number>}
   */
  displayedTotalSize: computed('currentTotalSize', 'normalizedNewTotalSize', function displayedTotalSize() {
    const {
      currentTotalSize,
      normalizedNewTotalSize,
    } = this.getProperties('currentTotalSize', 'normalizedNewTotalSize');
    if (normalizedNewTotalSize == null || normalizedNewTotalSize < currentTotalSize) {
      return currentTotalSize;
    } else {
      return normalizedNewTotalSize;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isCurrentTotalSizeValid: computed('currentTotalSize', function () {
    const currentTotalSize = this.get('currentTotalSize');
    return typeof currentTotalSize === 'number' && currentTotalSize >= 0;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isOccupiedSizeValid: computed('occupiedSize', function () {
    const occupiedSize = this.get('occupiedSize');
    return typeof occupiedSize === 'number' && occupiedSize >= 0;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isDataValid: computed.and('_isCurrentTotalSizeValid', '_isOccupiedSizeValid'),

  /**
   * @type {Ember.ComputedProperty<number>}
   */
  _newOccupiedPercents: computed(
    '_isDataValid',
    'occupiedSize',
    'normalizedNewTotalSize',
    'currentTotalSize',
    function _newOccupiedPercents() {
      const {
        _isDataValid,
        occupiedSize,
        normalizedNewTotalSize,
        currentTotalSize,
      } = this.getProperties(
        '_isDataValid',
        'occupiedSize',
        'normalizedNewTotalSize',
        'currentTotalSize',
      );

      if (_isDataValid) {
        if (normalizedNewTotalSize != null) {
          return normalizedNewTotalSize > 0 ?
            100 * (occupiedSize / normalizedNewTotalSize) : Number.POSITIVE_INFINITY;
        } else {
          return 100 * occupiedSize / currentTotalSize;
        }
      }
    }),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  _barOccupiedPercents: computed(
    '_isDataValid',
    'displayedTotalSize',
    'occupiedSize',
    function _barOccupiedPercents() {
      const {
        _isDataValid,
        displayedTotalSize,
        occupiedSize,
      } = this.getProperties('_isDataValid', 'displayedTotalSize', 'occupiedSize');

      return _isDataValid ? (occupiedSize / displayedTotalSize) * 100 : undefined;
    }
  ),

  /**
   * How much currentTotalSize is sharing from newTotalSize
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  _currentTotalPercents: computed(
    '_isDataValid',
    'currentTotalSize',
    'normalizedNewTotalSize',
    function _currentTotalPercents() {
      const {
        _isDataValid,
        currentTotalSize,
        normalizedNewTotalSize,
      } = this.getProperties('_isDataValid', 'currentTotalSize',
        'normalizedNewTotalSize');

      if (_isDataValid) {
        if (normalizedNewTotalSize == null) {
          return 100;
        } else {
          return (currentTotalSize / normalizedNewTotalSize) * 100;
        }
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _hasWarningUsage: computed('_newOccupiedPercents', function _hasWarningUsage() {
    const _newOccupiedPercents = this.get('_newOccupiedPercents');
    return _newOccupiedPercents > 90 && _newOccupiedPercents <= 100;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _hasCriticalUsage: gt('_newOccupiedPercents', 100),

  /**
   * Always positive newTotalSize
   * @type {ComputedProperty<number>}
   */
  normalizedNewTotalSize: computed('newTotalSize', function normalizedNewTotalSize() {
    const newTotalSize = this.get('newTotalSize');
    return newTotalSize && Math.max(newTotalSize, 0);
  }),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  _barOccupiedPercentsNormalized: computed('_barOccupiedPercents', function () {
    const _barOccupiedPercents = this.get('_barOccupiedPercents');
    return _barOccupiedPercents === undefined ?
      undefined : Math.min(_barOccupiedPercents, 100);
  }),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  _currentTotalPercentsNormalized: computed('_currentTotalPercents', function _currentTotalPercentsNormalized() {
    const _currentTotalPercents = this.get('_currentTotalPercents');
    return _currentTotalPercents === undefined ?
      undefined : Math.min(_currentTotalPercents, 100);
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _occupiedSpaceBarStyle: computed('_barOccupiedPercentsNormalized', function () {
    const _barOccupiedPercentsNormalized =
      this.get('_barOccupiedPercentsNormalized');
    return htmlSafe(
      _barOccupiedPercentsNormalized === undefined ?
      '' : `width: ${_barOccupiedPercentsNormalized}%`
    );
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _occupiedSpaceLabelStyle: computed('_barOccupiedPercentsNormalized', function () {
    const _barOccupiedPercentsNormalized = this.get(
      '_barOccupiedPercentsNormalized');
    const labelMargin = 20;
    if (_barOccupiedPercentsNormalized !== undefined) {
      const translateX =
        _barOccupiedPercentsNormalized > labelMargin ? -100 : 0;
      return htmlSafe(
        `left: ${_barOccupiedPercentsNormalized}%; transform: translateX(${translateX}%);`
      );
    } else {
      return htmlSafe('');
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _currentTotalSpaceLabelStyle: computed('_currentTotalPercentsNormalized', function () {
    const _currentTotalPercentsNormalized =
      this.get('_currentTotalPercentsNormalized');
    const labelMargin = 20;
    if (_currentTotalPercentsNormalized !== undefined) {
      const translateX =
        _currentTotalPercentsNormalized > labelMargin ? -100 : 0;
      return htmlSafe(
        `left: ${_currentTotalPercentsNormalized}%; transform: translateX(${translateX}%);`
      );
    } else {
      return htmlSafe('');
    }
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _newTotalSpaceBarStyle: computed(
    '_currentTotalPercentsNormalized',
    'normalizedNewTotalSize',
    'currentTotalSize',
    function _newTotalSpaceBarStyle() {
      const {
        _currentTotalPercentsNormalized,
        normalizedNewTotalSize,
        currentTotalSize,
      } = this.getProperties(
        '_currentTotalPercentsNormalized',
        'normalizedNewTotalSize',
        'currentTotalSize',
      );
      const sizeDiff = normalizedNewTotalSize - currentTotalSize;
      if (sizeDiff > 0) {
        return htmlSafe(
          _currentTotalPercentsNormalized === undefined ?
          '' : `left: ${_currentTotalPercentsNormalized}%;`
        );
      } else {
        return htmlSafe(
          `left: auto; right: 0; width: ${-100 * sizeDiff / currentTotalSize}%;`
        );
      }

    }
  ),

  /**
   * If true, we are expanding to the right, otherwise, we are shrinking
   * to the left. If undefined, there is no resize at all
   * @type {ComputedProperty<boolean|undefined>}
   */
  _newTotalSpaceExpandClass: computed(
    'normalizedNewTotalSize',
    'currentTotalSize',
    'minShowArrowFraction',
    function _newTotalSpaceExpandClass() {
      const {
        currentTotalSize,
        normalizedNewTotalSize,
        minShowArrowFraction,
      } = this.getProperties(
        'currentTotalSize',
        'normalizedNewTotalSize',
        'minShowArrowFraction'
      );
      const expandDiff = Math.abs(normalizedNewTotalSize - currentTotalSize) /
        currentTotalSize;
      if (normalizedNewTotalSize != null) {
        let classes =
          `new-total-space-expand new-total-space-expand-${currentTotalSize < normalizedNewTotalSize ? 'right' : 'left'}`;
        if (expandDiff > minShowArrowFraction) {
          classes +=
            ' new-total-space-expand-arrow';
        }
        return classes;
      }
    }
  ),
});
