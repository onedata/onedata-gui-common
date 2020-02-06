import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import FormFieldValidator from 'onedata-gui-common/utils/form-component/form-field-validator';
import { computed } from '@ember/object';
import { A } from '@ember/array';
import { buildValidations } from 'ember-cp-validations';
import { writable, conditional, or, not } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';

export default FormElement.extend({
  /**
   * @public
   * @virtual
   * @type {boolean}
   */
  isOptional: false,

  /**
   * @public
   * @type {boolean}
   * If true then value of this form field is ignored. Changes will not propagate,
   * (default)value dumps will always return undefined and field cannot be set as
   * modified
   */
  isValueless: false,

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
  isValid: writable(or('isValueless', 'fieldValidator.isValid')),

  /**
   * @override
   */
  invalidFields: conditional(
    or('isValid', not('isEffectivelyEnabled'), not('isVisible')),
    [],
    computed(function () { return [this]; }),
  ),

  /**
   * @type {ComputedProperty<Array<any>>}
   */
  errors: conditional('isValueless', [], 'fieldValidator.errors'),

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

  /**
   * @override
   */
  markAsModified() {
    if (!this.get('isValueless')) {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  valueChanged() {
    if (!this.get('isValueless')) {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
  dumpDefaultValue() {
    return this.get('isValueless') ? undefined : this._super(...arguments);
  },

  /**
   * @override
   */
  dumpValue() {
    return this.get('isValueless') ? undefined : this._super(...arguments);
  },
})
