import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend({
  classNames: ['field-component'],

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
  isEffectivelyEnabled: reads('field.isEffectivelyEnabled'),

  /**
   * @type {ComputedProperty<any>}
   */
  value: reads('field.value'),

  actions: {
    valueChanged(value) {
      this.get('field').valueChanged(value);
    },
    focusLost() {
      this.get('field').focusLost();
    },
  }
});
