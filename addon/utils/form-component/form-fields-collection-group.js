import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { observer, set, get, computed } from '@ember/object';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default FormFieldsGroup.extend({
  createdFieldsCounter: 0,

  /**
   * @override
   */
  fieldComponentName: 'form-component/form-fields-collection-group',

  /**
   * @public
   * @virtual
   */
  fieldFactoryMethod: notImplementedThrow,

  /**
   * @public
   * @type {ComputedProperty<HtmlSafe>}
   */
  addButtonText: computed('path', 'i18nPrefix', function addButtonText() {
    return this.tWithDefault(
      `${this.get('path')}.addButtonText`, {},
      this.tWithDefault(
        'components.formComponent.formFieldsCollectionGroup.addButtonText', {},
        undefined,
        false
      ),
    );
  }),

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

    const newField = this.fieldFactoryMethod(
      this.get('createdFieldsCounter'),
      get(fields, 'length')
    );
    this.incrementProperty('createdFieldsCounter');
    this.set('fields', fields.concat([newField]));
  },

  /**
   * @public
   * @param {Utils.FormComponent.FormElement} field 
   */
  removeField(field) {
    const fields = this.get('fields');

    this.set('fields', fields.without(field).slice(0));
  },

  /**
   * @override
   */
  dumpDefaultValue() {
    const defaultValue = this._super(...arguments);
    set(
      defaultValue,
      '__fieldsValueNames',
      this.get('fields').rejectBy('isValueless').mapBy('valueName')
    );
    return defaultValue;
  },

  /**
   * @override
   */
  dumpValue() {
    const value = this._super(...arguments);
    const fields = this.get('fields').rejectBy('isValueless');

    // Set default value to fields, which are not defined in values dump
    // (fields which were just added)
    fields.forEach(field => {
      const fieldValueName = get(field, 'valueName');
      if (!Object.keys(value).includes(fieldValueName)) {
        set(value, fieldValueName, field.dumpDefaultValue());
      }
    });

    // Add enumeration of existing fields
    set(value, '__fieldsValueNames', fields.mapBy('valueName'));

    return value;
  },
});
