import generateId from 'onedata-gui-common/utils/generate-id';

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

  return {
    id: generateId(),
    type: 'dataType',
    config: completeConfig,
  };
}
