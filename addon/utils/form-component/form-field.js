/**
 * A form field base class. Introduces validators mechanism. Provides one internal
 * validator - presenceValidator - which can be controlled by flag isOptional.
 *
 * @module utils/form-component/form-field
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import FormFieldValidator from 'onedata-gui-common/utils/form-component/form-field-validator';
import { computed, defineProperty } from '@ember/object';
import { union } from '@ember/object/computed';
import { A } from '@ember/array';
import { buildValidations } from 'ember-cp-validations';
import { writable, conditional, or, not } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';

export default FormElement.extend({
  /**
   * If false and value will be empty, then presence validator will notify an error
   * @virtual
   * @type {boolean}
   */
  isOptional: false,

  /**
   * If true then value of this form field is ignored. Changes will not propagate,
   * (default)value dumps will always return undefined and field cannot be set as
   * modified. Valueless fields may be used as a graphical elements of the form
   * (like spinners, separators etc.).
   * @virtual optional
   * @type {boolean}
   */
  isValueless: false,

  /**
   * Array of validators (created using validator() from ember-cp-validations).
   * Any custom validators added while creating new fields should be placed here.
   * NOTE: This property is not concatenated with the super class version on each
   * FormElement class extend.
   * @virtual optional
   * @type {Array<Object>}
   */
  customValidators: computed(() => A()),

  /**
   * Array of property names, which contain internal field validators (validators
   * which are predefined for field). Should not be modified directly but via
   * `registerInternalValidator` method.
   * @type {Array<String>}
   */
  internalValidatorsProps: computed(() => A()),

  /**
   * Set by `internalValidatorsSetter`
   * @type {ComputedProperty<Array<Object>>}
   */
  internalValidators: computed(() => A()),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  validators: union('customValidators', 'internalValidators'),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldValidator>}
   */
  fieldValidationChecker: computed('validators.[]', function fieldValidationChecker() {
    const validators = this.get('validators') || [];
    return FormFieldValidator
      .extend(buildValidations({ value: validators }))
      .create({ field: this });
  }),

  /**
   * Is writable for testing purposes
   * @override
   */
  isValid: writable(or(
    'isValueless',
    'isInViewMode',
    'fieldValidationChecker.isValid'
  )),

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
  errors: conditional('isValueless', [], 'fieldValidationChecker.errors'),

  /**
   * @type {ComputedProperty<Object>}
   */
  presenceValidator: computed('isOptional', function presenceValidator() {
    return this.get('isOptional') ? undefined : validator('presence', {
      presence: true,
      ignoreBlank: true,
    });
  }),

  init() {
    this._super(...arguments);

    this.registerInternalValidator('presenceValidator');
  },

  /**
   * Registers new internal validator as a string, which is a field property name where
   * the validator is defined. Ignores duplicates.
   * @param {String} propertyName
   */
  registerInternalValidator(propertyName) {
    this.get('internalValidatorsProps').addObject(propertyName);
    const internalValidatorsProps = this.get('internalValidatorsProps');

    defineProperty(this, 'internalValidators', computed(
      ...internalValidatorsProps,
      function internalValidators() {
        return internalValidatorsProps
          .map(validatorFieldName => this.get(validatorFieldName))
          .compact();
      }));
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
});
