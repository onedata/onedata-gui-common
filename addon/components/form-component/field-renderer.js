import Component from '@ember/component';
import layout from '../../templates/components/form-component/field-renderer';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { and, not } from 'ember-awesome-macros';

export default Component.extend({
  layout,
  classNames: ['field-renderer'],
  classNameBindings: [
    'isGroup::form-group',
    'validationClass',
  ],

  /**
   * @virtual
   * @type {Utils.FormComponent.FormField}
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
   * @type {ComputedProperty<boolean>}
   */
  isExpanded: reads('field.isExpanded'),
});
