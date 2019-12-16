import FormFieldsGroup from 'onedata-gui-common/components/form-component/form-fields-group';
import layout from '../../templates/components/form-component/form-fields-collection-group';
import { reads } from '@ember/object/computed';

export default FormFieldsGroup.extend({
  layout,
  classNames: ['form-fields-collection-group'],

  addButtonText: reads('field.addButtonText'),

  actions: {
    addField() {
      this.get('field').addNewField();
    },
    removeField(field) {
      this.get('field').removeField(field);
    },
  },
});
