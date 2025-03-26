/**
 * Autocomplete input with dropdown form field.
 *
 * It displays a list of predefined suggestions in dropdown that are dynamically filtered
 * as the user types in input. Users can either select a suggestion from the dropdown
 * or enter in input a completely custom value.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { computed } from '@ember/object';

const defaultI18nPrefix = 'components.formComponent.autocompleteDropdownField';

export default DropdownField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/autocomplete-dropdown-field',

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  customValueInputPlaceholder: computed(
    'i18nPrefix',
    'translationPath', {
      get() {
        return this.injectedCustomValueInputPlaceholder ?? this.getTranslation(
          'customValueInputPlaceholder', {}, {
            defaultValue: this.t(
              `${defaultI18nPrefix}.customValueInputPlaceholder`, {}, {
                defaultValue: '',
                usePrefix: false,
              },
            ),
          }
        );
      },
      set(key, value) {
        return this.injectedCustomValueInputPlaceholder = value;
      },
    }
  ),

  customValueOptionText: computed(
    'i18nPrefix',
    'translationPath', {
      get() {
        return this.injectedCustomValueOptionText ?? this.getTranslation(
          'customValueOptionText', {}, {
            defaultValue: this.t(
              `${defaultI18nPrefix}.customValueOptionText`, {}, {
                defaultValue: '',
                usePrefix: false,
              },
            ),
          }
        );
      },
      set(key, value) {
        return this.injectedCustomValueOptionText = value;
      },
    }
  ),

  /**
   * @type {string|null}
   */
  injectedCustomValueInputPlaceholder: null,

  /**
   * @type {string|null}
   */
  injectedCustomValueOptionText: null,
});
