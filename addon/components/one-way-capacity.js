/**
 * Capacity one-way editor.
 * 
 * @module components/one-way-capacity
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-way-capacity';
import { computed } from '@ember/object';
import bytesToString, { iecUnits } from 'onedata-gui-common/utils/bytes-to-string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,
  classNames: ['one-way-capacity', 'input-group'],

  /**
   * Value in bytes
   * @virtual
   * @type {number}
   */
  value: undefined,

  /**
   * @virtual
   * @type {Array<string>}
   */
  allowedUnits: Object.freeze(['MiB', 'GiB', 'TiB', 'PiB']),

  /**
   * @type {string}
   */
  inputId: computed('elementId', function inputId() {
    return this.get('elementId') + '-capacity';
  }),

  /**
   * Currently used size unit, like in `iecUnits`
   * @type {Object} with properties: name, multiplicator
   */
  sizeUnit: undefined,

  /**
   * @virtual
   * @type {Function}
   * @param {number} value value in bytes
   */
  onChange: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   */
  onFocusOut: notImplementedIgnore,

  /**
   * @virtual
   * @type {Function}
   * @param {Event} event
   */
  onKeyUp: notImplementedIgnore,

  /**
   * Value scaled to `selectedSizeUnit`
   * @type {Ember.ComputedProperty<number>}
   */
  scaledValue: computed('value', 'sizeUnit', function scaledValue() {
    const {
      value,
      sizeUnit,
    } = this.getProperties('value', 'sizeUnit');

    if (value === undefined) {
      return undefined;
    } else if (!value || !sizeUnit) {
      return 0;
    } else {
      return Math.round(value / sizeUnit.multiplicator * 10) / 10;
    }
  }),

  /**
   * Array of objects describing size units that will be displayed
   * in unit selector. Like `iecUnits` from `bytes-to-string`.
   * @type {ComputedProperty<Array<Object>>}
   */
  sizeUnits: computed('allowedUnits', function sizeUnits() {
    return this.get('allowedUnits').map(name =>
      iecUnits.find(u => u.name === name)
    );
  }),

  init() {
    this._super(...arguments);

    const {
      value,
      sizeUnits,
    } = this.getProperties('value', 'sizeUnits');

    let sizeUnit;
    if (value) {
      const { unit } = bytesToString(this.get('value'), { separated: true });
      sizeUnit = iecUnits.find(u => u.name === unit);
    } else {
      sizeUnit = sizeUnits[0];
    }
    
    this.set('sizeUnit', sizeUnit);
  },

  actions: {
    scaledValueChanged(scaledValue) {
      const {
        onChange,
        sizeUnit,
      } = this.getProperties('onChange', 'sizeUnit');
      
      let newValue;
      if (!sizeUnit) {
        newValue = Math.floor(scaledValue);
      } else {
        newValue = Math.floor(scaledValue * sizeUnit.multiplicator);
      }

      if (isNaN(newValue)) {
        newValue = undefined;
      }

      onChange(newValue);
    },
    sizeUnitChanged(sizeUnit) {
      const {
        scaledValue,
        onChange,
      } = this.getProperties('scaledValue', 'onChange');

      this.set('sizeUnit', sizeUnit);

      const newValue = Math.floor(scaledValue * sizeUnit.multiplicator);
      onChange(newValue);
    },
  }
});
