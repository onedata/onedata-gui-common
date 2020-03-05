/**
 * A container for dynamically generated fields. Use `addNewField` to add field, and
 * `removeField` to remove it from fields list. DO NOT modify fields array on your own.
 * Before usage you have to override `fieldFactoryMethod` so it returns form element.
 * 
 * @module utils/form-component/form-fields-collection-group
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import { observer, set, get, computed } from '@ember/object';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default FormFieldsGroup.extend({
  /**
   * @override
   */
  fieldComponentName: 'form-component/form-fields-collection-group',

  /**
   * @virtual
   */
  fieldFactoryMethod: notImplementedThrow,

  /**
   * @type {number}
   */
  createdFieldsCounter: 0,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  addButtonText: computed('path', 'i18nPrefix', function addButtonText() {
    return this.t(`${this.get('path')}.addButtonText`, {}, {
      defaultValue: this.t(
        'components.formComponent.formFieldsCollectionGroup.addButtonText', {}, {
          defaultValue: '',
          usePrefix: false,
        },
      ),
    });
  }),

  fieldsValueNamesObserver: observer(
    'fields.@each.valueName',
    function fieldsValueNamesObserver() {
      // Adding new field will call dumpValue, which will set value of the new field
      // to defaultValue.
      this.valueChanged(this.dumpValue());
    }
  ),

  /**
   * Fields on this list will have value set to defaultValue on next dumpValue call.
   * @type {Utils.FormComponent.FormElement}
   */
  fieldsToSetDefaultValue: computed(() => []),

  /**
   * @public
   */
  addNewField() {
    const {
      fields,
      fieldsToSetDefaultValue,
    } = this.getProperties('fields', 'fieldsToSetDefaultValue');

    const newField = this.fieldFactoryMethod(this.get('createdFieldsCounter'));
    this.incrementProperty('createdFieldsCounter');
    this.setProperties({
      fields: fields.concat([newField]),
      fieldsToSetDefaultValue: fieldsToSetDefaultValue.concat([newField]),
    });
  },

  /**
   * @public
   * @param {Utils.FormComponent.FormElement} field 
   */
  removeField(field) {
    const fields = this.get('fields');

    this.set('fields', fields.without(field));
  },

  /**
   * @override
   */
  dumpDefaultValue() {
    const defaultValue = this._super(...arguments);
    // Pass __fieldsValueNames with group value to inform about state of fields list.
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
    const fieldsToSetDefaultValue = this.get('fieldsToSetDefaultValue');
    const fields = this.get('fields').rejectBy('isValueless');

    // Set default value to fields, which are in fieldsToSetDefaultValue array
    // (fields which were just added to the collection)
    fields.forEach(field => {
      if (fieldsToSetDefaultValue.includes(field)) {
        set(value, get(field, 'valueName'), field.dumpDefaultValue());
      }
    });
    this.set('fieldsToSetDefaultValue', []);

    // Add enumeration of existing fields
    set(value, '__fieldsValueNames', fields.rejectBy('isValueless').mapBy('valueName'));

    return value;
  },
});
