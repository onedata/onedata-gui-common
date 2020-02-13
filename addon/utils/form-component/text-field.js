import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';
import { validator } from 'ember-cp-validations';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/text-like-field',

  /**
   * @public
   * @type {String}
   */
  inputType: 'text',

  /**
   * @public
   * @type {RegExp}
   */
  regex: undefined,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  placeholder: computed('i18nPrefix', 'path', function placeholder() {
    return this.tWithDefault(`${this.get('path')}.placeholder`, {}, undefined);
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

    this.registerInternalValidatorField('regexValidator');
  },
})
