/**
 * Reimplemented component taken from package ember-datetimepicker
 * See more: https://github.com/kellyselden/ember-datetimepicker
 * We cannot use ember-datetimepicker directly as it is not supported anymore.
 *
 * To be functional it needs npm packages:
 * - jquery-datetimepicker
 * - ember-cli-moment-shim
 * and files loaded from node_modules:
 * - jquery-datetimepicker/build/jquery.datetimepicker.min.css
 * - jquery-datetimepicker/build/jquery.datetimepicker.full.js
 *
 * @module components/one-datetime-picker
 * @author Michał Borzęcki
 * @copyright (C) 2019-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import moment from 'moment';
import $ from 'jquery';

export default Component.extend({
  tagName: 'input',
  classNames: ['one-datetime-picker', 'date-time-picker'],
  attributeBindings: ['disabled', 'placeholder'],

  /**
   * @virtual optional
   * @type {Date|null}
   */
  value: null,

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
   * @virtual optional
   * @type {(selectedDate: Date) => void}
   */
  onChange: undefined,

  /**
   * @virtual optional
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

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    this.set('initializationTime', new Date());
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);

    this.updateValue();

    scheduleOnce('afterRender', this, 'initDatetimepicker');
  },

  /**
   * @override
   */
  didUpdateAttrs() {
    this._super(...arguments);

    this.updateValue(true);
  },

  /**
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);

    $(this.get('element')).datetimepicker('destroy');
  },

  /**
   * @returns {void}
   */
  initDatetimepicker() {
    const {
      element,
      minDate,
      customDatetimePickerClassName,
    } = this.getProperties(
      'element',
      'minDate',
      'customDatetimePickerClassName'
    );

    const options = {
      lazyInit: true,
      minDate,
      className: customDatetimePickerClassName,
      onChangeDateTime: (newDateTime) => {
        this.changeHandler(newDateTime);
      },
    };

    $(element).datetimepicker(options);
  },

  /**
   * @param {Date|null} newValue
   * @returns {void}
   */
  changeHandler(newValue) {
    const {
      value: oldValue,
      onChange,
    } = this.getProperties('value', 'onChange');

    const newDatetimeFormat = newValue ? formatDate(newValue) : undefined;
    const oldDatetimeFormat = oldValue ? formatDate(oldValue) : undefined;

    if (newDatetimeFormat === oldDatetimeFormat) {
      return;
    }

    onChange && onChange(newValue);
  },

  /**
   * @param {boolean} shouldForceUpdatePicker
   * @returns {void}
   */
  updateValue(shouldForceUpdatePicker) {
    const {
      value,
      element,
    } = this.getProperties('value', 'element');

    const valueString = value ? formatDate(value) : '';
    element.value = valueString;

    if (shouldForceUpdatePicker) {
      $(element).datetimepicker({ value: valueString });
    }
  },
});

function formatDate(date) {
  return moment(date).format('YYYY/MM/DD H:mm');
}
