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
    return this.preparedOptions?.find(option => option?.value === value);
  },

  autoSetCustomValue: observer('value', function autoSetCustomValue() {
    if (this.findOption(this.value)) {
      return;
    }
    this.setCustomValue(this.value);
  }),

  init() {
    this._super(...arguments);
    this.set('customValueOption', EmberObject.create({
      value: '',
    }));
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
    const input = this.element?.querySelector('.ember-power-select-selected-item .custom-value-trigger-input');
    if (!input) {
      return;
    }
    input.focus();
  },

  isEventFromSearchInput(event) {
    return event.target.matches('.ember-power-select-search-input');
  },

  isEventFromCustomOptionInput(event) {
    return event.target.matches('.custom-value-trigger-input');
  },

  setCustomValue(value) {
    this.set('customValueOption.value', value);
  },

  actions: {
    valueChanged(option) {
      this._super(...arguments);
      if (this.isCustomInputOption(option)) {
        this.focusCustomInput();
      }
    },
    open(powerSelect, event) {
      this._super(...arguments);
      if (this.isEventFromCustomOptionInput(event)) {
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
