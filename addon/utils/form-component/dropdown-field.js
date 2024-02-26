/**
 * A dropdown form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OptionsField from 'onedata-gui-common/utils/form-component/options-field';
import { computed } from '@ember/object';

export default OptionsField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/dropdown-field',

  /**
   * @virtual optional
   * @type {boolean}
   */
  showSearch: true,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'translationPath', {
    get() {
      return this.injectedPlaceholder ??
        // Null value, because powerselect converts `undefined` to string 'undefined'
        this.getTranslation('placeholder', {}, { defaultValue: null });
    },
    set(key, value) {
      return this.injectedPlaceholder = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedPlaceholder: null,
});
