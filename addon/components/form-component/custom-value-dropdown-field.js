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
import { or, raw } from 'ember-awesome-macros';

export default DropdownField.extend({
  layout,
  classNames: ['custom-value-dropdown-field'],

  customInputValuePlaceholder: or(
    'field.customValueInputPlaceholder',
    // FIXME: przenieść do defaultowych i18n dla komponentu
    raw('Enter custom value...')
  ),

  customInputOptionTextPrefix: or(
    'field.customInputOptionTextPrefix',
    // FIXME: przenieść do defaultowych i18n dla komponentu
    raw('Custom value...')
  ),

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

  isEventFromSearchInput(event) {
    return event.target.matches('.ember-power-select-search-input');
  },

  isEventFromCustomOptionInput(event) {
    return event.target.matches('.custom-option-input');
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
    click(powerSelect, event) {
      console.log(event);
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
