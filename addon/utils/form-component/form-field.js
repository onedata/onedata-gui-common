import FormElement from 'onedata-gui-common/utils/form-component/form-element';
import FormFieldValidator from 'onedata-gui-common/utils/form-component/form-field-validator';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { A } from '@ember/array';
import { buildValidations } from 'ember-cp-validations';
import { conditional } from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';

export default FormElement.extend(OwnerInjector, I18n, {
  i18n: service(),

  /**
   * @public
   * @virtual
   * @type {boolean}
   */
  isOptional: false,

  /**
   * @public
   * @virtual
   * @type {boolean}
   */
  withValidationIcon: true,

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
    'isOptional',
    function validators() {
      const {
        customValidators,
        isOptional,
      } = this.getProperties('customValidators', 'isOptional');

      const validatorsArray = customValidators.slice();

      if (!isOptional) {
        validatorsArray.push(validator('presence', {
          presence: true,
          ignoreBlank: true,
        }));
      }

      return validatorsArray;
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldValidator>}
   */
  fieldValidator: computed('validators.[]', function fieldValidator() {
    const validators = this.get('validators') || [];
    return FormFieldValidator
      .extend(buildValidations({ value: validators }))
      .create({
        ownerSource: this,
        field: this,
      });
  }),

  /**
   * @override
   */
  isValid: reads('fieldValidator.isValid'),

  /**
   * @override
   */
  invalidFields: conditional(
    'isValid',
    [],
    computed(function () { return [this]; }),
  ),

  /**
   * @type {ComputedProperty<Array<any>>}
   */
  errors: reads('fieldValidator.errors'),

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  label: computed('i18nPrefix', 'path', function label() {
    return fallbackTranslation(this.t(this.get('path') + '.label'), undefined);
  }),

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  tip: computed('i18nPrefix', 'path', function tip() {
    return fallbackTranslation(this.t(this.get('path') + '.tip'), undefined);
  }),
})

function fallbackTranslation(translation, fallback) {
  return String(translation).startsWith('<missing-') ? fallback : translation;
}
