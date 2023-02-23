/**
 * A simple EmberObject extensions that is an environment for ember-cp-validations mechanism.
 * Each form field creates an instance of this class with injected validators (and does
 * it on each validators change) and then reads state of validation from `errors`
 * and `isValid` fields. It is an internal class of the forms framework and should not
 * be modified neither accessed from the outside of the internal forms framework code.
 *
 * @module utils/form-component/form-field-validator
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { observer, defineProperty } from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { reads } from '@ember/object/computed';
import { isEmpty } from 'ember-awesome-macros';

export default EmberObject.extend(OwnerInjector, {
  /**
   * @type {Utils.FormComponent.FormField}
   */
  field: undefined,

  /**
   * @override
   */
  ownerSource: reads('field.ownerSource'),

  /**
   * @type {ComputedProperty<any>}
   */
  value: reads('field.value'),

  /**
   * Can be used to write validators based on values from different fields.
   * @type {ComputedProperty<any>}
   */
  valuesSource: reads('field.valuesSource'),

  /**
   * Set to computed property by `errorsSetter`.
   * @type {ComputedProperty<Array<any>>}
   */
  errors: Object.freeze([]),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isValid: isEmpty('errors'),

  errorsSetter: observer('ownerSource', function errorsSetter() {
    if (this.ownerSource) {
      // Owner is needed for ember-cp-validations code. We have to ensure, that
      // owner is properly injected before any validations.
      this.ownerSourceObserver();
      defineProperty(this, 'errors', reads('validations.errors'));
      // Get `errors` to recalculate property value.
      this.errors;
    }
  }),

  init() {
    this._super(...arguments);
    this.errorsSetter();
  },
});
