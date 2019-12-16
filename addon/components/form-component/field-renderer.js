import Component from '@ember/component';
import layout from '../../templates/components/form-component/field-renderer';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { and, not } from 'ember-awesome-macros';

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
  isGroup: reads('field.isGroup'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isValid: reads('field.isValid'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  showValidationState: and('field.isModified', not('isGroup')),

  /**
   * @type {ComputedProperty<String>}
   */
  validationClass: computed(
    'isValid',
    'showValidationState',
    function validationClass() {
      const {
        isValid,
        showValidationState,
      } = this.getProperties('isValid', 'showValidationState');

      if (showValidationState) {
        return isValid ? 'has-success' : 'has-error';
      }
    }
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
