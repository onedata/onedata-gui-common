/**
 * An adapter component for date-time-picker from ember-datetimepicker.
 * 
 * @module components/one-datetime-picker
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DateTimePicker from 'ember-datetimepicker/components/date-time-picker';
import { computed } from '@ember/object';
import moment from 'moment';

export default DateTimePicker.extend({
  classNames: ['one-datetime-picker'],
  attributeBindings: ['disabled', 'placeholder'],

  /**
   * @virtual optional
   * @type {boolean}
   */
  disabled: undefined,

  /**
   * @virtual optional
   * @type {string}
   */
  placeholder: undefined,

  /**
   * @type {Function} 
   * @param {Date} selectedDate
   */
  onChange: undefined,

  /**
   * @type {string}
   */
  customDatetimePickerClassName: 'datetime-picker',

  /**
   * Set in `init()`. Do not override!
   * @type {Date}
   */
  initializationTime: null,

  /**
   * Min date allowed in format Y/m/d
   * @virtual optional
   * @type {Ember.ComputedProperty<string>}
   */
  minDate: computed('initializationTime', function minDate() {
    const initializationTime = this.get('initializationTime');
    return initializationTime ? moment(initializationTime).format('Y/M/D') : null;
  }),

  init() {
    this._super(...arguments);

    this.set('initializationTime', new Date());

    this.addCustomClassToDatetimePicker();
    this.set('options', Object.assign({
      lazyInit: true,
      minDate: this.get('minDate'),
    }, this.get('options')));
  },

  /**
   * Overrides action callback with onChange callback to be more consistent with
   * our naming policy.
   * @override
   */
  action() {
    return this.get('onChange')(...arguments);
  },

  addCustomClassToDatetimePicker() {
    const {
      options,
      customDatetimePickerClassName,
    } = this.getProperties('options', 'customDatetimePickerClassName');

    if (options.className) {
      options.className += ' ' + customDatetimePickerClassName;
    } else {
      options.className = customDatetimePickerClassName;
    }
  },
});
