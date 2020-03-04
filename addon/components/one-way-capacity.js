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
import { computed, observer } from '@ember/object';
import bytesToString, { iecUnits } from 'onedata-gui-common/utils/bytes-to-string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  layout,
  classNames: ['one-way-capacity', 'input-group'],

  /**
   * Value in bytes
   * @virtual
   * @type {string}
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
   * @param {string} value value in bytes
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
   * @type {string}
   */
  scaledValue: '0',

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

  scaledValueModifier: observer('value', 'sizeUnit', function scaledValueModifier() {
    const {
      value,
      sizeUnit,
      scaledValue,
    } = this.getProperties('value', 'sizeUnit', 'scaledValue');

    let newScaledSize;

    if (value === undefined) {
      newScaledSize = undefined;
    } else if (!value || !sizeUnit) {
      newScaledSize = '0';
    } else {
      const prevValue = String(this.getValueInBytes(scaledValue));
      if (prevValue !== value) {
        const scaledValueCandidate =
          Math.round(value / sizeUnit.multiplicator * 10) / 10;
        newScaledSize = isNaN(scaledValueCandidate) ? value : scaledValueCandidate;
      } else {
        return;
      }
    }
    this.set('scaledValue', newScaledSize);
  }),

  init() {
    this._super(...arguments);

    const {
      value,
      sizeUnits,
    } = this.getProperties('value', 'sizeUnits');

    let sizeUnit;
    if (value && !isNaN(Number(value))) {
      const { unit } = bytesToString(value, { separated: true });
      sizeUnit = iecUnits.find(u => u.name === unit);
    } else {
      sizeUnit = sizeUnits[0];
    }

    this.set('sizeUnit', sizeUnit);
    this.scaledValueModifier();
  },

  /**
   * @param {string} scaledValue 
   * @param {Object} sizeUnit 
   */
  getValueInBytes(scaledValue, sizeUnit = undefined) {
    const multiplicator = (sizeUnit && sizeUnit.multiplicator) ||
      this.get('sizeUnit.multiplicator') || 1;

    return Math.floor(scaledValue * multiplicator);
  },

  actions: {
    scaledValueChanged(scaledValue) {
      this.set('scaledValue', scaledValue);

      let newValue = this.getValueInBytes(scaledValue);
      if (isNaN(newValue)) {
        newValue = scaledValue;
      }

      this.get('onChange')(String(newValue));
    },
    sizeUnitChanged(sizeUnit) {
      const {
        scaledValue,
        onChange,
      } = this.getProperties('scaledValue', 'onChange');

      this.set('sizeUnit', sizeUnit);

      const newValue = this.getValueInBytes(scaledValue, sizeUnit.multiplicator);
      if (!isNaN(newValue)) {
        onChange(String(newValue));
      }
    },
  },
});
