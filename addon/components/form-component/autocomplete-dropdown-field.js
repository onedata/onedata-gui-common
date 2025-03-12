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

export default DropdownField.extend({
  layout,
  classNames: ['autocomplete-dropdown-field'],

  customValueInputPlaceholder: reads('field.customValueInputPlaceholder'),

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  preparedOptions: computed('field.preparedOptions', function preparedOptions() {
    return [...this.field.preparedOptions];
  }),

  selectedOption: computed(
    'preparedOptions.@each.value', 'value',
    function selectedOption() {
      if (this.findOption(this.value)) {
        return this.findOption(this.value);
      } else {
        return {
          name: this.value,
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
    onInput(e) {
      this._super(...arguments);
      this.actions.valueChanged.bind(this)({
        name: e,
        value: e,
        label: e,
      });
    },
    open(powerSelect) {
      powerSelect.actions.search(this.value);
      this.actions.onInput.bind(this)(this.value);
    },
  },
});
