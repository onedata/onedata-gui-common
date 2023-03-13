/**
 * A component responsible for rendering dropdown with custom value input field.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DropdownField from 'onedata-gui-common/components/form-component/dropdown-field';
import layout from '../../templates/components/form-component/custom-value-dropdown-field';
import EmberObject from '@ember/object';
import { reads } from '@ember/object/computed';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { computed } from '@ember/object';

export default DropdownField.extend({
  layout,
  classNames: ['custom-value-dropdown-field'],

  customInputPlaceholder: 'Enter custom value...',

  customInputOptionTextPrefix: 'Custom value...',

  //#region state

  isCustomInputFocused: false,

  //#endregion

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  // preparedOptions: reads('field.preparedOptions'),

  preparedOptions: computed('field.preparedOptions', function preparedOptions() {
    return [
      ...this.field.preparedOptions,
      this.customInputOption,
    ];
  }),

  // FIXME: zdecydować, czy przy wyszukiwaniu powinno zawsze pokazywać customowego itema

  // customInputOptionText: computed('customInputOptionTextPrefix', 'customInputValue', function () {
  //   let text = this.customInputOptionTextPrefix;
  //   if (this.customInputValue) {
  //     text += ` <span class="custom-option-value">(${this.customInputValue})</span>`;
  //   }
  //   return htmlSafe(text);
  // }),

  isCustomInputOptionIconShown: reads('field.isCustomInputOptionIconShown'),

  customInputOptionIcon: reads('field.customInputOptionIcon'),

  customInputValue: computed({
    get() {
      return this.customInputOption.value;
    },
    set(key, value) {
      return this.set('customInputOption.value', value);
    },
  }),

  selectedOption: computed('preparedOptions.@each.value', 'value', function selectedOption() {
    return this.preparedOptions?.find(option => option?.value === this.value);
  }),

  init() {
    this._super(...arguments);
    this.set('customInputOption', EmberObject.create({
      value: '',
    }));
    // FIXME: debug
    window.customValueDropdownField = this;
  },

  isCustomInputOption(option) {
    return option === this.customInputOption;
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
    const input = this.element?.querySelector('.ember-power-select-selected-item .custom-option-input');
    if (!input) {
      return;
    }
    input.focus();
  },

  actions: {
    valueChanged(option) {
      this._super(option);
      if (this.isCustomInputOption(option)) {
        this.focusCustomInput();
      }
    },
    focus() {
      this.focusCustomInput();
    },
    keyDown(powerSelect, event) {
      if (this.isCustomInputOption(this.selectedOption)) {
        event.stopPropagation();
        return false;
      }
    },
    // FIXME: sprawdzić co to
    triggerFocusLost() {
      const element = this.get('element');
      const trigger =
        element && element.querySelector('.ember-basic-dropdown-trigger');
      // Focus lost due to opening dropdown should be omitted
      if (!trigger || trigger.getAttribute('aria-expanded') !== 'true') {
        this.send('focusLost');
      }
    },
    onInputFocus() {
      this.set('isCustomInputFocused', true);
    },
    onInputBlur() {
      this.set('isCustomInputFocused', false);
    },
    onCustomInput(value) {
      // this.set('customInputValue', value);
      this.set('customInputOption.value', value);
      this.field.valueChanged(value);
    },
  },
});
