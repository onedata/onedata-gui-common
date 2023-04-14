/**
 * A dropdown with custom value input form field.
 *
 * It represents set of predefined options to select and special option that allows
 * to enter own string.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { computed } from '@ember/object';

const defaultI18nPrefix = 'components.formComponent.customValueDropdownField';

export default DropdownField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/custom-value-dropdown-field',

  /**
   * @virtual optional
   * @type {boolean}
   */
  showSearch: false,

  /**
   * @virtual optional
   * @type {boolean}
   */
  isCustomInputOptionIconShown: false,

  /**
   * @virtual optional
   * @type {string}
   */
  customValueOptionIcon: 'rename',

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  customValueInputPlaceholder: computed(
    'i18nPrefix',
    'translationPath',
    function customInputPlaceholder() {
      // Null value, because powerselect converts `undefined` to string 'undefined'
      return this.getTranslation(
        'customValueInputPlaceholder', {}, {
          defaultValue: this.t(
            `${defaultI18nPrefix}.customValueInputPlaceholder`, {}, {
              defaultValue: '',
              usePrefix: false,
            },
          ),
        }
      );
    }
  ),

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  customValueOptionTextPrefix: computed(
    'i18nPrefix',
    'translationPath',
    function customInputPlaceholder() {
      // Null value, because powerselect converts `undefined` to string 'undefined'
      return this.getTranslation(
        'customValueOptionTextPrefix', {}, {
          defaultValue: this.t(
            `${defaultI18nPrefix}.customValueOptionTextPrefix`, {}, {
              defaultValue: '',
              usePrefix: false,
            },
          ),
        }
      );
    }
  ),
});
