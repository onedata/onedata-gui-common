import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import FormFieldValidator from 'onedata-gui-common/utils/form-component/form-field-validator';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { A } from '@ember/array';
import { buildValidations } from 'ember-cp-validations';
import { conditional, or, not } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';

export default FormElement.extend({
  /**
   * @public
   * @virtual
   * @type {boolean}
   */
  isOptional: false,

  /**
   * @type {Array<String>}
   */
  internalValidatorsFields: Object.freeze([]),

  /**
   * Set by registerInternalValidatorField
   * @type {ComputedProperty<Array<Object>>}
   */
  internalValidators: undefined,

  /**
   * @type {ComputedProperty<Object>}
   */
  presenceValidator: computed('isOptional', function presenceValidator() {
    return this.get('isOptional') ? undefined : validator('presence', {
      presence: true,
      ignoreBlank: true,
    });
  }),

  /**
   * Array of validators (created using validator() from ember-cp-validations)
   * @public
   * @type {Array<Object>}
   */
  customValidators: computed(() => A()),

  /**
   * @type {Array<Object>}
   */
  validators: computed(
    'customValidators.[]',
    'internalValidators.[]',
    function validators() {
      const {
        customValidators,
        internalValidators,
      } = this.getProperties('customValidators', 'internalValidators');

      return customValidators.concat(internalValidators || []);
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldValidator>}
   */
  fieldValidator: computed('validators.[]', function fieldValidator() {
    const validators = this.get('validators') || [];
    return FormFieldValidator
      .extend(buildValidations({ value: validators }))
      .create({ field: this });
  }),

  /**
   * @override
   */
  isValid: reads('fieldValidator.isValid'),

  /**
   * @override
   */
  invalidFields: conditional(
    or('isValid', not('isEnabled'), not('isVisible')),
    [],
    computed(function () { return [this]; }),
  ),

  /**
   * @type {ComputedProperty<Array<any>>}
   */
  errors: reads('fieldValidator.errors'),

  init() {
    this._super(...arguments);

    this.registerInternalValidatorField('presenceValidator');
  },

  registerInternalValidatorField(fieldName) {
    const internalValidatorsFields =
      this.get('internalValidatorsFields').concat([fieldName]);

    this.setProperties({
      internalValidatorsFields: internalValidatorsFields,
      internalValidators: computed(
        ...internalValidatorsFields,
        function internalValidators() {
          return internalValidatorsFields
            .map(validatorFieldName => this.get(validatorFieldName))
            .compact();
        }),
    });
  },
})
