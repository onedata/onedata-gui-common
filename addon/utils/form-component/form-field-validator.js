import EmberObject from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { reads } from '@ember/object/computed';
import { isEmpty } from 'ember-awesome-macros';

export default EmberObject.extend(OwnerInjector, {
  /**
   * @type {Utils.FormComponent.FormField}
   */
  field: undefined,

  /**
   * @type {ComputedProperty<any>}
   */
  value: reads('field.value'),

  /**
   * @type {ComputedProperty<any>}
   */
  valuesSource: reads('field.valuesSource'),

  /**
   * @type {ComputedProperty<Array<any>>}
   */
  errors: reads('validations.errors'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isValid: isEmpty('errors'),
})
