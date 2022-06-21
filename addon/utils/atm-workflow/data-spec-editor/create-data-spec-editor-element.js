import generateId from 'onedata-gui-common/utils/generate-id';
import valueConstraintsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors';

export function createDataTypeSelectorElement() {
  return {
    id: generateId(),
    type: 'dataTypeSelector',
  };
}

export function createDataTypeElement(dataType, config = {}) {
  const completeConfig = Object.assign({}, config, {
    dataType,
  });

  if (dataType === 'array' && !completeConfig.item) {
    completeConfig.item = createDataTypeSelectorElement();
  }

  if (dataType in valueConstraintsEditors && !completeConfig.formValues) {
    completeConfig.formValues =
      valueConstraintsEditors[dataType].valueConstraintsToFormValues(null);
  }

  return {
    id: generateId(),
    type: 'dataType',
    config: completeConfig,
  };
}
