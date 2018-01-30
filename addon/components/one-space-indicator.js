import Component from '@ember/component';
import { computed } from '@ember/object';
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
      totalSize,
      occupiedSize,
      _isTotalSizeValid,
     } = this.getProperties('totalSize', 'occupiedSize', '_isTotalSizeValid');
    return _isTotalSizeValid && typeof occupiedSize === 'number' &&
      occupiedSize >= 0 && occupiedSize <= totalSize;
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
    
    return _isOccupiedSizeValid ? (occupiedSize / totalSize) * 100 : undefined;
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _occupiedSpaceBarStyle: computed('_occupiedPercents', function () {
    const _occupiedPercents = this.get('_occupiedPercents');
    return _occupiedPercents === undefined ? '' : `width: ${_occupiedPercents}%`;
  }),
});
