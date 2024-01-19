/**
 * A JSON form field.
 *
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
  fieldComponentName: 'form-component/json-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'translationPath', {
    get() {
      return this.injectedPlaceholder ??
        this.getTranslation('placeholder', {}, { defaultValue: '' });
    },
    set(key, value) {
      return this.injectedPlaceholder = value;
    },
  }),

  /**
   * @type {string | null}
   */
  injectedPlaceholder: null,

  /**
   * @type {ComputedProperty<Object>}
   */
  jsonValidator: computed(() => validator('json')),

  init() {
    this._super(...arguments);

    this.registerInternalValidator('jsonValidator');
  },
});
