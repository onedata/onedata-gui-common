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
    return _isTotalSizeValid && typeof occupiedSize === 'number' &&
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

    return _isOccupiedSizeValid ? (occupiedSize / totalSize) * 100 : undefined;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _hasWarningUsage: computed('_occupiedPercents', function () {
    const _occupiedPercents = this.get('_occupiedPercents');
    return _occupiedPercents > 90 && _occupiedPercents < 100;
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  _hasCriticalUsage: gt('_occupiedPercents', 100),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  _occupiedPercentsNormalized: computed('_occupiedPercents', function () {
    const _occupiedPercents = this.get('_occupiedPercents');
    return _occupiedPercents === undefined ?
      undefined : Math.min(_occupiedPercents, 100);
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _occupiedSpaceBarStyle: computed('_occupiedPercentsNormalized', function () {
    const _occupiedPercentsNormalized = this.get('_occupiedPercentsNormalized');
    return htmlSafe(
      _occupiedPercentsNormalized === undefined ?
      '' : `width: ${_occupiedPercentsNormalized}%`
    );
  }),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  _occupiedSpaceLabelStyle: computed('_occupiedPercentsNormalized', function () {
    const _occupiedPercentsNormalized = this.get('_occupiedPercentsNormalized');
    const labelMargin = 20;
    if (_occupiedPercentsNormalized !== undefined) {
      const translateX =
        _occupiedPercentsNormalized > labelMargin ? -100 : 0;
      return htmlSafe(
        `left: ${_occupiedPercentsNormalized}%; transform: translateX(${translateX}%);`
      );
    } else {
      return htmlSafe('');
    }
  }),
});
