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

export default FormElement.extend(OwnerInjector, I18n, {
  i18n: service(),

  /**
   * Array of validators (created using validator() from ember-cp-validations)
   * @type {Array<Object>}
   */
  validators: computed(() => A()),

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
    return this.t(this.get('path') + '.label');
  }),

  /**
   * @type {ComputedProperty<HtmlSafe>}
   */
  tip: computed('i18nPrefix', 'path', function tip() {
    return this.t(this.get('path') + '.tip');
  }),
})
