/**
 * A component responsible for rendering dropdown with autocomplete input field.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DropdownField from 'onedata-gui-common/components/form-component/dropdown-field';
import layout from '../../templates/components/form-component/autocomplete-dropdown-field';
import { computed } from '@ember/object';
import _ from 'lodash';
import { reads } from '@ember/object/computed';

/**
 * @typedef {object} AutocompleteDropdownOption
 * @property {string} value
 * @property {string} label
 * @property {boolean} isCustom
 */

export default DropdownField.extend({
  layout,
  classNames: ['autocomplete-dropdown-field'],

  /**
   * @type {AutocompleteDropdownOption}
   */
  customValueOption: undefined,

  isCustomInputFocused: false,

  customValueInputPlaceholder: reads('field.customValueInputPlaceholder'),

  customValueOptionText: reads('field.customValueOptionText'),

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  preparedOptions: computed(
    'field.preparedOptions',
    'customValueOption.value',
    function preparedOptions() {
      if (this.customValueOption && this.customValueOption.value) {
        return [
          this.customValueOption,
          ...this.field.options,
        ];
      }
      return this.field.options;
    }
  ),

  selectedOption: computed(
    'preparedOptions.@each.value', 'value',
    function selectedOption() {
      if (this.findOption(this.value)) {
        return this.findOption(this.value);
      } else {
        return {
          value: this.value,
          label: this.value,
        };
      }
    }
  ),

  findOption(value) {
    return _.findLast(this.preparedOptions, option => option?.value === value);
  },

  actions: {
    onInput(value) {
      this._super(...arguments);
      const option = this.findOption(value);
      if (option && !option.isCustom) {
        this.set('customValueOption', undefined);
      } else {
        this.set('customValueOption', {
          value: value,
          label: value,
          isCustom: true,
        });
      }
      this.actions.valueChanged.bind(this)({
        value: value,
        label: value,
      });
    },
    open(powerSelect) {
      powerSelect.actions.search(this.value);
      this.actions.onInput.bind(this)(this.value);
    },
    onInputFocus() {
      this.set('isCustomInputFocused', true);
    },
    onInputBlur() {
      this.set('isCustomInputFocused', false);
    },
  },
});
