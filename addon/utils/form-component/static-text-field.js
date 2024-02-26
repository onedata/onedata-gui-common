/**
 * A static text form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/static-text-field',

  /**
   * @override
   */
  isValid: true,

  /**
   * Will be shown to user if `value` is not defined.
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  text: computed('i18nPrefix', 'translationPath', {
    get() {
      return this.injectedText ?? this.getTranslation('text', {}, { defaultValue: '' });
    },
    set(key, value) {
      return this.injectedText = value;
    },
  }),

  /**
   * Custom text injected during field creation.
   * @type {string | null}
   */
  injectedText: null,
});
