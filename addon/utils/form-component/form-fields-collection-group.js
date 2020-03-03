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
import _ from 'lodash';

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

  /**
   * Fields on this list will have value set to defaultValue on next dumpValue call.
   * @type {Utils.FormComponent.FormElement}
   */
  fieldsToSetDefaultValue: computed(() => []),

  fieldsValueNamesObserver: observer(
    'fields.@each.valueName',
    function fieldsValueNamesObserver() {
      if (!_.isEqual(
          _.sortBy(this.getFieldsValueNames()),
          _.sortBy(this.get('value.__fieldsValueNames') || [])
        )) {
        // Adding new field will call dumpValue, which will set value of the new field
        // to defaultValue.
        this.valueChanged(this.dumpValue());
      }
    }
  ),

  incomingFieldsValueNamesObserver: observer(
    'value.__fieldsValueNames.[]',
    function () {
      const fields = this.get('fields');
      const incomingFieldsValueNames = this.get('value.__fieldsValueNames') || [];
      const newFields = incomingFieldsValueNames
        .map(valueName => {
          const existingField = fields.findBy('valueName', valueName);
          if (existingField) {
            return existingField;
          } else {
            return this.fieldFactoryMethod(valueName);
          }
        });
      this.set('fields', newFields);
      this.fieldsParentSetter();
    }
  ),

  init() {
    this._super(...arguments);
    if (this.get('value.__fieldsValueNames')) {
      this.incomingFieldsValueNamesObserver();
    } else {
      this.fieldsValueNamesObserver();
    }
  },

  /**
   * @public
   */
  addNewField() {
    const {
      fields,
      fieldsToSetDefaultValue,
    } = this.getProperties('fields', 'fieldsToSetDefaultValue');

    const newField = this.fieldFactoryMethod(this.generateUniqueFieldValueName());
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
      this.getFieldsValueNames(),
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
    set(value, '__fieldsValueNames', this.getFieldsValueNames());

    return value;
  },

  /**
   * @returns {Array<String>}
   */
  getFieldsValueNames() {
    return this.get('fields').rejectBy('isValueless').mapBy('valueName');
  },

  /**
   * @returns {String}
   */
  generateUniqueFieldValueName() {
    const {
      createdFieldsCounter,
      name,
    } = this.getProperties(
      'createdFieldsCounter',
      'name'
    );
    const fieldsValueNames = this.getFieldsValueNames();

    let newCreatedFieldsCounter = createdFieldsCounter;
    let uniqueFieldValueName;
    do {
      uniqueFieldValueName = `${name}Entry${newCreatedFieldsCounter}`;
      newCreatedFieldsCounter++;
    } while (fieldsValueNames.includes(uniqueFieldValueName))

    this.set('createdFieldsCounter', newCreatedFieldsCounter);

    return uniqueFieldValueName;
  },
});
