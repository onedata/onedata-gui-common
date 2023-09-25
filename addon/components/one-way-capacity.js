/**
 * Capacity one-way editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../templates/components/one-way-capacity';
import { computed, observer } from '@ember/object';
import { iecUnits } from 'onedata-gui-common/utils/bytes-to-string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import _ from 'lodash';

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
   * @virtual optional
   * @type {String}
   */
  placeholder: undefined,

  /**
   * @virtual
   * @type {Array<string>}
   */
  allowedUnits: Object.freeze(['MiB', 'GiB', 'TiB', 'PiB']),

  /**
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  inputId: computed('elementId', {
    get() {
      return this.elementId + '-capacity';
    },
    set(key, value) {
      return this.injectedInputId = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedInputId: null,

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
   * Value displayed inside text input (so is should be `value` divided by
   * `sizeUnit.multiplicator`).
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

  scaledValueModifier: observer('value', function scaledValueModifier() {
    const {
      value,
      sizeUnit,
      scaledValue,
    } = this.getProperties('value', 'sizeUnit', 'scaledValue');

    let newScaledValue;
    let newSizeUnit = sizeUnit;

    if (!value && value !== '0') {
      newScaledValue = '';
    } else if (isNaN(Number(value))) {
      newScaledValue = value;
    } else {
      const prevValue = String(this.getValueInBytes(scaledValue));
      if (prevValue !== value) {
        newSizeUnit = this.getUnitForBytes(value);
        newScaledValue = Math.round(value / newSizeUnit.multiplicator * 10) / 10;
      } else {
        return;
      }
    }
    this.setProperties({
      scaledValue: String(newScaledValue),
      sizeUnit: newSizeUnit,
    });
  }),

  init() {
    this._super(...arguments);

    this.set('sizeUnit', this.get('sizeUnits')[0]);
    this.scaledValueModifier();
  },

  /**
   * @param {string} scaledValue
   * @param {Object} sizeUnit
   * @returns {number}
   */
  getValueInBytes(scaledValue, sizeUnit = undefined) {
    const multiplicator = (sizeUnit && sizeUnit.multiplicator) ||
      this.get('sizeUnit.multiplicator') || 1;
    const parsedScaledValue = parseFloat(scaledValue);
    return Number.isNaN(parsedScaledValue) ?
      parsedScaledValue : Math.floor(parsedScaledValue * multiplicator);
  },

  getUnitForBytes(bytes) {
    const sortedSizeUnits = this.get('sizeUnits').sortBy('multiplicator');
    return _.findLast(sortedSizeUnits, (sizeUnit) => sizeUnit.multiplicator <= bytes) ||
      sortedSizeUnits[0];
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

      const newValue = this.getValueInBytes(scaledValue, sizeUnit);
      if (!isNaN(newValue)) {
        onChange(String(newValue));
      }
    },
  },
});
