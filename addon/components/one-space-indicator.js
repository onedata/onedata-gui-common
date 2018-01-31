/**
 * A bar chart that shows used space according to given totalSize and occupiedSize.
 *
 * @module components/one-space-indicator
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import layout from '../templates/components/one-space-indicator';

export default Component.extend({
  layout,
  classNames: ['one-space-indicator'],

  /**
   * @virtual
   * @type {number}
   */
  totalSize: undefined,

  /**
   * @virtual
   * @type {number}
   */
  occupiedSize: undefined,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isTotalSizeValid: computed('totalSize', function () {
    const totalSize = this.get('totalSize');
    return typeof totalSize === 'number' && totalSize >= 0;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _isOccupiedSizeValid: computed('_isTotalSizeValid', 'occupiedSize', function () {
    const {
      occupiedSize,
      _isTotalSizeValid,
     } = this.getProperties('occupiedSize', '_isTotalSizeValid');
    return _isTotalSizeValid && typeof occupiedSize === 'number'&&
      occupiedSize >= 0;
  }),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  _occupiedPercents: computed('_isOccupiedSizeValid', function () {
    const {
      _isOccupiedSizeValid,
      totalSize,
      occupiedSize,
    } = this.getProperties('_isOccupiedSizeValid', 'totalSize', 'occupiedSize');
    
    return _isOccupiedSizeValid ?
      (Math.min(occupiedSize, totalSize) / totalSize) * 100 : undefined;
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _occupiedSpaceBarStyle: computed('_occupiedPercents', function () {
    const _occupiedPercents = this.get('_occupiedPercents');
    return htmlSafe(
      _occupiedPercents === undefined ? '' : `width: ${_occupiedPercents}%`
    );
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _occupiedSpaceLabelStyle: computed('_occupiedPercents', function () {
    const _occupiedPercents = this.get('_occupiedPercents');
    const labelMargin = 15;
    if (_occupiedPercents !== undefined) {
      const translateX = 
        _occupiedPercents > labelMargin ? -100 : 0;
      return htmlSafe(
        `left: ${_occupiedPercents}%; transform: translateX(${translateX}%);`
      );
    } else {
      return htmlSafe('');
    }
  }),
});
