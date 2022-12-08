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

const defaultI18nPrefix = 'components.formComponent.formFieldsCollectionGroup';

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
   * @virtual optional
   */
  isCollectionManipulationAllowed: true,

  /**
   * @type {number}
   */
  createdFieldsCounter: 0,

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  addButtonText: computed('translationPath', 'i18nPrefix', function addButtonText() {
    return this.getTranslation('addButtonText', {}, {
      defaultValue: this.t(
        `${defaultI18nPrefix}.addButtonText`, {}, {
          defaultValue: '',
          usePrefix: false,
        },
      ),
    });
  }),

  /**
   * @virtual optional
   * @type {ComputedProperty<HtmlSafe>}
   */
  emptyCollectionViewModeText: computed(
    'translationPath',
    'i18nPrefix',
    function emptyCollectionViewModeText() {
      return this.getTranslation('emptyCollectionViewModeText', {}, {
        defaultValue: this.t(
          `${defaultI18nPrefix}.emptyCollectionViewModeText`, {}, {
            defaultValue: '',
            usePrefix: false,
          },
        ),
      });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.FormComponent.FormElement>>}
   */
  fieldsToAdd: computed(() => []),

  incomingFieldsValueNamesObserver: observer(
    'value.__fieldsValueNames.[]',
    function incomingFieldsValueNamesObserver() {
      const {
        fields,
        fieldsToAdd,
      } = this.getProperties('fields', 'fieldsToAdd');
      let newFieldsToAdd = fieldsToAdd;
      const incomingFieldsValueNames = this.get('value.__fieldsValueNames') || [];
      const newFields = incomingFieldsValueNames
        .map(valueName => {
          const existingField = fields.findBy('valueName', valueName);
          if (existingField) {
            return existingField;
          } else {
            const fieldToAdd = fieldsToAdd.findBy('valueName', valueName);
            if (fieldToAdd) {
              newFieldsToAdd = newFieldsToAdd.without(fieldToAdd);
              return fieldToAdd;
            } else {
              const field = this.fieldFactoryMethod(valueName);
              return field;
            }
          }
        });
      const areFieldsTheSame =
        newFields.every((field, index) => fields[index] === field) &&
        get(newFields, 'length') === get(fields, 'length');
      if (!areFieldsTheSame) {
        this.set('fields', newFields);
        this.fieldsParentSetter();
      }
      this.set('fieldsToAdd', newFieldsToAdd);
    }
  ),

  init() {
    this._super(...arguments);
    this.incomingFieldsValueNamesObserver();
  },

  /**
   * @public
   */
  addNewField() {
    const newValue = this.dumpValue();
    const newFieldValueName = this.generateUniqueFieldValueName();
    const newField = this.fieldFactoryMethod(newFieldValueName);
    set(newField, 'parent', this);

    set(newValue, newFieldValueName, newField.dumpDefaultValue());
    get(newValue, '__fieldsValueNames').push(newFieldValueName);
    this.get('fieldsToAdd').push(newField);

    this.valueChanged(newValue);
  },

  /**
   * @public
   * @param {Utils.FormComponent.FormElement} field
   */
  removeField(field) {
    const fieldValueName = get(field, 'valueName');
    const newValue = this.dumpValue();
    delete newValue[fieldValueName];
    set(
      newValue,
      '__fieldsValueNames',
      get(newValue, '__fieldsValueNames').without(fieldValueName)
    );
    this.valueChanged(newValue);
  },

  /**
   * @override
   */
  dumpDefaultValue() {
    const defaultValue = this._super(...arguments);
    if (!get(defaultValue, '__fieldsValueNames')) {
      set(
        defaultValue,
        '__fieldsValueNames',
        this.getFieldsValueNames(),
      );
    }
    return defaultValue;
  },

  /**
   * @override
   */
  dumpValue() {
    const value = this._super(...arguments);
    set(value, '__fieldsValueNames', this.getFieldsValueNames());
    return value;
  },

  /**
   * @returns {Array<String>}
   */
  getFieldsValueNames() {
    return this.get('fields').mapBy('valueName');
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
    } while (fieldsValueNames.includes(uniqueFieldValueName));

    this.set('createdFieldsCounter', newCreatedFieldsCounter);

    return uniqueFieldValueName;
  },
});
