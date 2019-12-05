import FormField from 'onedata-gui-common/utils/form-component/form-field';
import { computed } from '@ember/object';
import { validator } from 'ember-cp-validations';

export default FormField.extend({
  /**
   * @virtual
   */
  fieldComponentName: 'form-component/json-field',

  /**
   * @override
   */
  withValidationIcon: false,

  /**
   * @type {ComputedProperty<Object>}
   */
  jsonValidator: computed(function jsonValidator() {
    return validator('json');
  }),

  init() {
    this._super(...arguments);

    this.registerInternalValidatorField('jsonValidator');
  },
})
