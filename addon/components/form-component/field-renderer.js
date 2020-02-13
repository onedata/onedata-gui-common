import Component from '@ember/component';
import layout from '../../templates/components/form-component/field-renderer';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { and } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  classNames: ['field-renderer', 'form-group'],
  classNameBindings: [
    'validationClass',
    'fieldNameClass',
    'fieldComponentClass',
    'field.classes',
  ],

  /**
   * @virtual
   * @type {Utils.FormComponent.FormElement}
   */
  field: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  fieldId: computed('elementId', function fieldId() {
    return `${this.get('elementId')}-field`;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isValid: reads('field.isValid'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isModified: reads('field.isModified'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isEffectivelyEnabled: reads('field.isEffectivelyEnabled'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  withValidationIcon: reads('field.withValidationIcon'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  areValidationClassesEnabled: reads('field.areValidationClassesEnabled'),

  /**
   * @type {ComputedProperty<String>}
   */
  validationClass: computed(
    'isValid',
    'isModified',
    'areValidationClassesEnabled',
    function validationClass() {
      const {
        isValid,
        isModified,
        areValidationClassesEnabled,
      } = this.getProperties(
        'isValid',
        'isModified',
        'areValidationClassesEnabled'
      );

      if (isModified && areValidationClassesEnabled) {
        return isValid ? 'has-success' : 'has-error';
      }
    }
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  canShowValidationIcon: and(
    'isModified',
    'isEffectivelyEnabled',
    'withValidationIcon'
  ),

  /**
   * @type {ComputedProperty<boolean>}
   */
  canShowValidationMessage: and(
    'isModified',
    'isEffectivelyEnabled',
    'error'
  ),

  /**
   * @type {ComputedProperty<Object>}
   */
  error: reads('field.errors.firstObject'),

  /**
   * @type {ComputedProperty<String>}
   */
  fieldNameClass: computed('field.name', function fieldNameClass() {
    const name = this.get('field.name');
    return name && `${name}-field`;
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  fieldComponentClass: computed('field.name', function fieldComponentClass() {
    // It takes only the last part of component name. So it transforms
    // 'form-component/radio-field' to 'radio-field-renderer'.
    const fieldComponentName = this.get('field.fieldComponentName');
    if (fieldComponentName) {
      const componentNameParts = fieldComponentName.split('/');
      return `${componentNameParts[componentNameParts.length - 1]}-renderer`;
    }
  }),
});
