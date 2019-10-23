/**
 * An adapter component for date-time-picker from ember-datetimepicker.
 * 
 * @module components/one-datetime-picker
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DateTimePicker from 'ember-datetimepicker/components/date-time-picker';

export default DateTimePicker.extend({
  classNames: ['one-datetime-picker'],

  /**
   * @type {Function}
   * @param {Date} selectedDate
   */
  onChange: undefined,

  /**
   * @type {string}
   */
  customDatetimePickerClassName: 'datetime-picker',

  init() {
    this._super(...arguments);

    this.addCustomClassToDatetimePicker();
    this.set('options', Object.assign({
      lazyInit: true,
    }, this.get('options')));
  },

  /**
   * Overrides action callback with onChange callback to be more consistent with
   * our naming policy.
   * @override
   */
  action() {
    return this.get('onChange')();
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
