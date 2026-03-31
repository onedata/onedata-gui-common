/**
 * A text form field.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { validator } from 'ember-cp-validations';

export default FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/text-like-field',

  /**
   * @virtual optional
   * @type {String}
   */
  inputType: 'text',

  /**
   * @virtual optional
   * @type {RegExp}
   */
  regex: undefined,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'translationPath', {
    get() {
      return this.customPlaceholder ??
        this.getTranslation('placeholder', {}, { defaultValue: '' });
    },
    set(key, value) {
      return this.customPlaceholder = value;
    },
  }),

  /**
   * @type {string | null}
   */
  customPlaceholder: null,

  /**
   * @virtual optional
   * @type {string}
   */
  lockHint: undefined,

  /**
   * @type {ComputedProperty<SafeString | string>}
   */
  valueForViewMode: reads('value'),

  /**
   * @type {ComputedProperty<Object>}
   */
  regexValidator: computed('regex', function regexValidator() {
    const regex = this.get('regex');
    const message = this.getTranslation('regexMessage', {}, { defaultValue: '' });
    if (!regex) {
      return undefined;
    } else if (message) {
      return validator('format', {
        regex,
        // Always allow blank in regex, because empty strings are checked by presence validator
        allowBlank: true,
        message,
      });
    } else {
      return validator('format', {
        regex,
        // Always allow blank in regex, because empty strings are checked by presence validator
        allowBlank: true,
      });
    }

  }),

  init() {
    this._super(...arguments);

    this.registerInternalValidator('regexValidator');
  },
});
