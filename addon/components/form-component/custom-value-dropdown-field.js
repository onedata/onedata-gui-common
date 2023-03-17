/**
 * A component responsible for rendering dropdown with custom value input field.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DropdownField from 'onedata-gui-common/components/form-component/dropdown-field';
import layout from '../../templates/components/form-component/custom-value-dropdown-field';
import EmberObject, { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { computed } from '@ember/object';
import { raw, conditional } from 'ember-awesome-macros';
import _ from 'lodash';

export default DropdownField.extend({
  layout,
  classNames: ['custom-value-dropdown-field'],

  customValueInputPlaceholder: reads('field.customValueInputPlaceholder'),

  customValueOptionTextPrefix: reads('field.customValueOptionTextPrefix'),

  //#region state

  isCustomInputFocused: false,

  //#endregion

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  preparedOptions: computed('field.preparedOptions', function preparedOptions() {
    return [
      ...this.field.preparedOptions,
      this.customValueOption,
    ];
  }),

  isCustomInputOptionIconShown: reads('field.isCustomInputOptionIconShown'),

  customValueOptionIcon: reads('field.customValueOptionIcon'),

  selectedOption: computed('preparedOptions.@each.value', 'value', function selectedOption() {
    return this.findOption(this.value);
  }),

  findOption(value) {
    return _.findLast(this.preparedOptions, option => option?.value === value);
  },

  autoSetCustomValue: observer('value', function autoSetCustomValue() {
    if (this.value == null || this.findOption(this.value)) {
      return;
    }
    this.setCustomValue(this.value);
  }),

  customValueOption: computed(function customValueOption() {
    return EmberObject.extend({
      icon: conditional(
        'dropdown.isCustomInputOptionIconShown',
        'dropdown.customValueOptionIcon',
        raw(null),
      ),
      // NOTE: the label is rendered using HTML in HBS - consider changing this
      // text label if HBS label changes
      label: computed(
        'dropdown.isInViewMode',
        'customValueOptionTextPrefix',
        'value',
        function label() {
          if (this.dropdown.isInViewMode) {
            return this.value;
          } else {
            let label = this.dropdown.customValueOptionTextPrefix;
            if (this.value) {
              label += ` (${this.value})`;
            }
            return label;
          }
        }
      ),
      name: '__custom-value__',
    }).create({
      dropdown: this,
      value: '',
    });
  }),

  init() {
    this._super(...arguments);
    this.autoSetCustomValue();
  },

  isCustomInputOption(option) {
    return option === this.customValueOption;
  },

  async focusCustomInput() {
    await waitForRender();
    if (
      !this.element ||
      this.isDestroyed ||
      this.isDestroying ||
      !this.isCustomInputOption(this.selectedOption)
    ) {
      return;
    }
    const input = this.element?.querySelector(
      '.ember-power-select-selected-item .custom-value-trigger-input'
    );
    if (!input) {
      return;
    }
    input.focus();
  },

  isEventFromSearchInput(event) {
    return Boolean(
      event.target.matches('.ember-power-select-search-input')
    );
  },

  isEventFromCustomOptionInput(event) {
    return Boolean(
      event.target.matches('.custom-value-trigger-input')
    );
  },

  isEventFromCustomOptionInTrigger(event) {
    return Boolean(
      event.target.closest('.ember-power-select-selected-item .custom-value-option')
    );
  },

  setCustomValue(value) {
    this.set('customValueOption.value', value);
  },

  isPredefinedOptionWithSameValueAsCustom(option) {
    return option !== this.customValueOption &&
      this.customValueOption.value === option.value &&
      this.preparedOptions.filter(o => o.value === option?.value).length > 1;
  },

  actions: {
    valueChanged(option) {
      // to not block selecting predefined option with the same values as current custom
      // value, clear custom value if a duplicate is found
      if (this.isPredefinedOptionWithSameValueAsCustom(option)) {
        this.customValueOption.set('value', '');
      }
      this._super(...arguments);
      if (this.isCustomInputOption(option)) {
        this.focusCustomInput();
      }
    },
    open(powerSelect, event) {
      this._super(...arguments);
      if (this.isEventFromCustomOptionInTrigger(event)) {
        return false;
      }
    },
    focus(powerSelect, event) {
      if (this.isEventFromSearchInput(event)) {
        return;
      }
      this.focusCustomInput();
    },
    keyDown(powerSelect, event) {
      if (this.isEventFromCustomOptionInput(event)) {
        event.stopPropagation();
        return false;
      }
    },
    onInputFocus() {
      this.set('isCustomInputFocused', true);
    },
    onInputBlur() {
      this.set('isCustomInputFocused', false);
    },
    onCustomInput(value) {
      this.setCustomValue(value);
      this.field.valueChanged(value);
    },
  },
});
