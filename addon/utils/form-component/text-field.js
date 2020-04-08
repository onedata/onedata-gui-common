/**
 * A text form field.
 * 
 * @module utils/form-component/text-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';
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
  placeholder: computed('i18nPrefix', 'path', function placeholder() {
    return this.t(`${this.get('path')}.placeholder`, {}, { defaultValue: '' });
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  regexValidator: computed('regex', function regexValidator() {
    const regex = this.get('regex');
    return !regex ? undefined : validator('format', {
      regex,
      // Always allow blank in regex, because empty strings are checked by presence validator
      allowBlank: true,
    });
  }),

  init() {
    this._super(...arguments);

    this.registerInternalValidator('regexValidator');
  },
});
