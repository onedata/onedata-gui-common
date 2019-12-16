import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { observer, set, get } from '@ember/object';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default FormFieldsGroup.extend({
  fieldFactoryMethod: notImplementedThrow,

  fieldsValueNamesObserver: observer(
    'fields.@each.valueName',
    function fieldsValueNamesObserver() {
      this.valueChanged(this.dumpValue());
    }
  ),

  /**
   * @public
   */
  addNewField() {
    const fields = this.get('fields');

    const newField = this.fieldFactoryMethod(get(fields, 'length'));
    this.set('fields', fields.concat([newField]));
  },

  /**
   * @public
   * @param {Utils.FormComponent.FormElement} field 
   */
  removeField(field) {
    const fields = this.get('fields');

    delete this.get('value')[get(field, 'valueName')];
    this.set('fields', fields.without(field).slice(0));
  },

  /**
   * @override
   */
  dumpDefaultValue() {
    const defaultValue = this._super(...arguments);
    set(defaultValue, '__fieldsValueNames', this.get('fields').mapBy('valueName'));
    return defaultValue;
  },

  /**
   * @override
   */
  dumpValue() {
    const value = this._super(...arguments);
    set(value, '__fieldsValueNames', this.get('fields').mapBy('valueName'));
    return value;
  },
});
