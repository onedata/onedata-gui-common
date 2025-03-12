/**
 * Autocomplete input with dropdown form field.
 *
 * It represents set of predefined options to select and special option that allows
 * to enter own string.
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

  /**
   * @type {string | null}
   */
  injectedCustomValueInputPlaceholder: null,
});
