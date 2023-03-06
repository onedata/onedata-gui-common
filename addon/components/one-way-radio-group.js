import Component from '@ember/component';
import layout from 'onedata-gui-common/templates/components/one-way-radio-group';

/**
 * Creates radio inputs group based one the one-toggle-radio component.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
export default Component.extend({
  layout,
  classNames: ['one-way-radio-group'],
  classNameBindings: ['isReadOnly:disabled'],
  attributeBindings: ['dataOption:data-option'],

  /**
   * To inject.
   * Name of the field (used to generate class names for radio inputs)
   * @type {string}
   */
  fieldName: '',

  /**
   * Element ID for first rendered radio input
   * @type {string}
   */
  inputId: null,

  /**
   * If true, user couldn't change value
   * @type {boolean}
   */
  isReadOnly: false,

  /**
   * Optional - data-option attribute for rendered component
   * @type {string}
   */
  dataOption: null,

  /**
   * To inject.
   * A function called, when selected value changes
   * @type {Function}
   */
  update: null,

  /**
   * If true, all labels will have `radio-inline` class (to display them in the one line)
   * @type {boolean}
   */
  radioInline: true,

  actions: {
    updateHandler(value) {
      if (value !== this.value) {
        // Radio input becomes checked just after user click without waiting for
        // the selected value change from parent component - it's not a correct
        // "one-way" approach. It's a bug in `ember-one-way-controls` package,
        // which is not maintained. In order to fix that issue, we syntetically
        // deselect input just after its selection and we wait for the selection
        // driven by `value` taken from the parent component.
        const currentlySelectedInputIdx = this.options
          .findIndex((opt) => opt.value === this.value);
        const changedInputIdx = this.options
          .findIndex((opt) => opt.value === value);
        const inputs = this.element.querySelectorAll('input');
        if (currentlySelectedInputIdx !== -1) {
          // Restore selection on input related to the `this.value` - current
          // selection from the parent component.
          inputs[currentlySelectedInputIdx].checked = true;
        }
        if (changedInputIdx !== -1) {
          // Deselect clicked input as we don't know yet whether or not
          // parent component will accept that update.
          inputs[changedInputIdx].checked = false;
        }
      }

      const update = this.get('update');
      if (update) {
        update(value, this);
      }
    },
  },
});
