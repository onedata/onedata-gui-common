/**
 * Provides a form element capable of showing, creating and modifying data specs.
 * It also provides two methods for conversion between form values and data spec
 * in both directions.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, getProperties, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import {
  dataSpecToType,
  typeToDataSpec,
} from 'onedata-gui-common/utils/workflow-visualiser/data-spec-converters';
import valueConstraintsEditors from './value-constraints-editors';

export const dataSpecTypes = Object.freeze([
  'integer',
  'string',
  'object',
  'anyFile',
  'regularFile',
  'directory',
  'symlink',
  'dataset',
  'range',
  'timeSeriesMeasurement',
  'onedatafsCredentials',
]);

export const FormElement = FormFieldsGroup.extend({
  /**
   * @virtual optional
   * @type {Array<string>}
   */
  allowedTypes: dataSpecTypes,

  classes: 'data-spec-editor',
  i18nPrefix: 'utils.atmWorkflow.dataSpecEditor.fields',
  // Does not take parent fields group translation path into account
  translationPath: '',
  fields: computed(() => [
    TypeField.create(),
    ValueConstraintsField.create(),
  ]),
});

const TypeField = DropdownField.extend({
  name: 'type',
  options: computed('parent.allowedTypes.[]', function options() {
    const allowedTypes = this.get('parent.allowedTypes') || dataSpecTypes;
    return dataSpecTypes
      .filter((type) => allowedTypes.includes(type))
      .map((type) => ({ value: type }));
  }),
  defaultValue: reads('options.firstObject.value'),
  optionsObserver: observer('options', function optionsObserver() {
    const {
      options,
      value,
    } = this.getProperties('options', 'value');
    if (value && options.length && !options.findBy('value', value)) {
      this.valueChanged(options[0].value);
    }
  }),
});

const adjustedValueConstraintsEditorFields = Object.keys(valueConstraintsEditors)
  .map((type) => valueConstraintsEditors[type].FormElement.extend({
    name: getValueConstraintsFieldName(type),
    isVisible: computed('parent.parent.value.type', function isVisible() {
      return this.get('parent.parent.value.type') === type;
    }),
  }));

const ValueConstraintsField = FormFieldsGroup.extend({
  name: 'valueConstraints',
  fields: computed(() =>
    adjustedValueConstraintsEditorFields.map((field) => field.create())
  ),
});

/**
 * @param {AtmDataSpec} dataSpec
 * @returns {Utils.FormComponent.ValuesContainer} form values ready to use in a form
 */
export function dataSpecToFormValues(dataSpec, { allowedTypes = dataSpecTypes } = {}) {
  const normalizedDataSpec = dataSpec || {};
  const {
    type,
    isArray,
  } = dataSpecToType(normalizedDataSpec);
  const valueConstraints = isArray ?
    get(normalizedDataSpec, 'valueConstraints.itemDataSpec.valueConstraints') :
    normalizedDataSpec.valueConstraints;

  const valueConstraintsFormValue = {};
  for (const valueConstraintsType in valueConstraintsEditors) {
    const valueConstraintsForType = valueConstraintsType === type ?
      valueConstraints : undefined;
    const fieldName = getValueConstraintsFieldName(valueConstraintsType);
    valueConstraintsFormValue[fieldName] = valueConstraintsEditors[valueConstraintsType]
      .valueConstraintsToFormValues(valueConstraintsForType);
  }

  return createValuesContainer({
    type: type || allowedTypes[0],
    valueConstraints: createValuesContainer(valueConstraintsFormValue),
  });
}

/**
 * @param {Utils.FormComponent.ValuesContainer} values Values from data spec editor
 * @param {boolean} [surroundWithArray=false] if true, calculated data spec will
 * be wrapped into array data spec
 * @returns {AtmDataSpec} data spec
 */
export function formValuesToDataSpec(values, surroundWithArray = false) {
  const {
    type,
    valueConstraints,
  } = getProperties(values || {}, 'type', 'valueConstraints');

  let customValueConstraints = undefined;
  if (type in valueConstraintsEditors) {
    customValueConstraints = valueConstraintsEditors[type].formValuesToValueConstraints(
      get(valueConstraints, getValueConstraintsFieldName(type))
    );
  }

  const dataSpec = typeToDataSpec({
    type,
    isArray: false,
    customValueConstraints,
  });

  return surroundWithArray ? {
    type: 'array',
    valueConstraints: {
      itemDataSpec: dataSpec,
    },
  } : dataSpec;
}

function getValueConstraintsFieldName(type) {
  return `${type}ValueConstraints`;
}
