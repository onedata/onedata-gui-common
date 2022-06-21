import FormField from 'onedata-gui-common/utils/form-component/form-field';
import {
  createDataTypeSelectorElement,
  createDataTypeElement,
} from './create-data-spec-editor-element';
import valueConstraintsEditors from './value-constraints-editors';

export const FormElement = FormField.extend({
  /**
   * @override
   */
  fieldComponentName: 'atm-workflow/data-spec-editor',

  /**
   * @override
   */
  withValidationIcon: false,
});

export function dataSpecToFormValues(dataSpec) {
  if (!dataSpec || !dataSpec.type) {
    return createDataTypeSelectorElement();
  }

  const dataType = dataSpec.type;
  const valueConstraints = dataSpec.valueConstraints || {};

  if (dataType in valueConstraintsEditors) {
    return createDataTypeElement(dataType, {
      formValues: valueConstraintsEditors[dataType]
        .valueConstraintsToFormValues(valueConstraints),
    });
  } else if (dataType === 'array') {
    return createDataTypeElement(dataType, {
      item: dataSpecToFormValues(valueConstraints.itemDataSpec),
    });
  } else {
    return createDataTypeElement(dataType);
  }
}

export function formValuesToDataSpec(values) {
  if (
    !values ||
    !values.type !== 'dataType' ||
    !values.config ||
    !values.config.dataType
  ) {
    return null;
  }

  const dataType = values.config.dataType;

  if (dataType in valueConstraintsEditors) {
    return {
      type: dataType,
      valueConstraints: valueConstraintsEditors[dataType]
        .formValuesToValueConstraints(values.config.formValues),
    };
  } else if (dataType === 'array') {
    return {
      type: dataType,
      valueConstraints: {
        itemDataSpec: formValuesToDataSpec(values.config.item),
      },
    };
  } else {
    return {
      type: dataType,
      valueConstraints: {},
    };
  }
}
