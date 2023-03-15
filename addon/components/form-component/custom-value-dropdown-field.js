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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { or } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';

export default DropdownField.extend(I18n, {
  layout,
  classNames: ['custom-value-dropdown-field'],

  /**
   * @override
   */
  i18nPrefix: 'components.formComponent.customValueDropdownField',

  customValueInputPlaceholder: or(
    'field.customValueInputPlaceholder',
    computedT('customValueInputPlaceholder'),
  ),

  customValueOptionTextPrefix: or(
    'field.customValueOptionTextPrefix',
    computedT('customValueOptionTextPrefix'),
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
      this.customValueOption,
    ];
  }),

  isCustomInputOptionIconShown: reads('field.isCustomInputOptionIconShown'),

  customValueOptionIcon: reads('field.customValueOptionIcon'),

  selectedOption: computed('preparedOptions.@each.value', 'value', function selectedOption() {
    return this.preparedOptions?.find(option => option?.value === this.value);
  }),

  init() {
    this._super(...arguments);
    this.set('customValueOption', EmberObject.create({
      value: '',
    }));
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
      this.set('customValueOption.value', value);
      this.field.valueChanged(value);
    },
  },
});
