/**
 * Atm parameters spec editor. Suitable for editing atm lambda arguments and
 * config parameters.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  computed,
  observer,
  defineProperty,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import {
  or,
  not,
  and,
  isEmpty,
} from 'ember-awesome-macros';
import { validator } from 'ember-cp-validations';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import {
  dataSpecToFormValues,
  formValuesToDataSpec,
  FormElement as DataSpecEditor,
} from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import {
  ValueEditorField as AtmValueEditorField,
  rawValueToFormValue as atmRawValueToFormValue,
  formValueToRawValue as atmFormValueToRawValue,
} from 'onedata-gui-common/utils/atm-workflow/value-editors';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

export const AtmParameterSpecsEditor = FormFieldsCollectionGroup.extend({
  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.atmLambda.atmParameterSpecsEditor',

  /**
   * Do not take parent fields group translation path into account.
   * @override
   */
  translationPath: '',

  /**
   * @override
   */
  isVisible: not(and('isInViewMode', isEmpty('value.__fieldsValueNames'))),

  /**
   * @override
   */
  isDefaultValueIgnored: false,

  /**
   * @type {ComputedProperty<Array<string> | null>}
   */
  usedNames: null,

  usedNamesSetter: observer(
    'value.__fieldsValueNames',
    function usedNamesSetter() {
      const namePropsPaths = (this.value?.__fieldsValueNames ?? [])
        .map(valueName => `value.${valueName}.entryName`);
      defineProperty(
        this,
        'usedNames',
        computed(...namePropsPaths, function usedNames() {
          return namePropsPaths
            .map((valuePath) => this.get(valuePath))
            .filter(Boolean);
        })
      );
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.usedNamesSetter();
  },

  /**
   * @override
   */
  fieldFactoryMethod(uniqueFieldValueName) {
    const entryFieldsGroup = EntryFieldsGroup.create({
      valueName: uniqueFieldValueName,
    });
    entryFieldsGroup.changeMode(this.mode !== 'view' ? 'edit' : 'view');
    return entryFieldsGroup;
  },
});

/**
 * @param {Array<AtmLambdaParameterSpec>} rawValue
 * @returns {Utils.FormComponent.ValuesContainer}
 */
export function rawValueToAtmParameterSpecsEditorValue(rawValue) {
  const formData = createValuesContainer({
    __fieldsValueNames: [],
  });
  rawValue?.forEach((entry, idx) => {
    if (!entry?.name || !entry?.dataSpec) {
      return;
    }

    const valueName = `entry${idx}`;
    formData.__fieldsValueNames.push(valueName);
    formData[valueName] = createValuesContainer({
      entryName: entry.name,
      entryDataSpec: dataSpecToFormValues(entry.dataSpec, true),
      entryIsOptional: entry.isOptional === true,
      entryDefaultValue: atmRawValueToFormValue(entry.defaultValue, true),
    });
  });
  return formData;
}

/**
 * @param {Utils.FormComponent.ValuesContainer} formValue
 * @returns {Array<AtmLambdaParameterSpec>}
 */
export function atmParameterSpecsEditorValueToRawValue(formValue) {
  return (formValue?.__fieldsValueNames ?? [])
    .map((valueName) => formValue[valueName])
    .filter(Boolean)
    .map((entry) => ({
      name: entry.entryName,
      dataSpec: formValuesToDataSpec(entry.entryDataSpec, true),
      isOptional: Boolean(entry.entryIsOptional),
      defaultValue: atmFormValueToRawValue(entry.entryDefaultValue),
    }));
}

const EntryFieldsGroup = FormFieldsGroup.extend({
  /**
   * @override
   */
  name: 'entry',

  /**
   * @override
   */
  fields: computed(() => [
    EntryNameField.create(),
    EntryDataSpecField.create(),
    EntryIsOptionalField.create(),
    EntryDefaultValueField.create(),
  ]),
});

const EntryNameField = TextField.extend({
  /**
   * @override
   */
  name: 'entryName',

  /**
   * @override
   */
  defaultValue: '',

  /**
   * @override
   */
  customValidators: Object.freeze([
    validator(function validator(value, options, model) {
      const field = model?.field;
      const trimmedValued = value?.trim();
      if (!trimmedValued || !field) {
        return true;
      }

      const usedNames = (field.usedNames ?? []).map((name) => name.trim());
      if (usedNames.filter((name) => name === trimmedValued).length > 1) {
        return String(field.getTranslation('errors.notUnique'));
      } else {
        return true;
      }
    }, {
      dependentKeys: ['model.field.usedNames'],
    }),
  ]),

  /**
   * @type {ComputedProperty<Array<string> | null>}
   */
  usedNames: reads('parent.parent.usedNames'),
});

const EntryDataSpecField = DataSpecEditor.extend({
  /**
   * @override
   */
  name: 'entryDataSpec',

  /**
   * @override
   */
  showExpandParams: true,
});

const EntryIsOptionalField = ToggleField.extend({
  media: service(),

  /**
   * @override
   */
  name: 'entryIsOptional',

  /**
   * @override
   */
  classes: 'right-floating-toggle',

  /**
   * @override
   */
  defaultValue: false,

  /**
   * @override
   */
  addColonToLabel: or('media.isMobile', 'media.isTablet'),
});

const EntryDefaultValueField = AtmValueEditorField.extend({
  /**
   * @override
   */
  name: 'entryDefaultValue',

  /**
   * @overide
   */
  isOptional: true,

  /**
   * @override
   */
  isVisible: or(not('isInViewMode'), 'value.hasValue'),

  /**
   * @type {Utils.FormComponent.FormField}
   */
  atmDataSpecField: computed('parent.fields.[]', function atmDataSpecField() {
    return this.parent?.fields.find((field) => field.name === 'entryDataSpec');
  }),

  atmDataSpecSetter: observer(
    'atmDataSpecField.{value,isValid}',
    function atmDataSpecSetter() {
      const atmDataSpec = this.atmDataSpecField?.isValid ?
        formValuesToDataSpec(this.atmDataSpecField.value) : null;
      this.set('atmDataSpec', atmDataSpec);
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.atmDataSpecSetter();
  },
});
