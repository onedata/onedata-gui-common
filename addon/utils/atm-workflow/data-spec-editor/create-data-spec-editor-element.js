import generateId from 'onedata-gui-common/utils/generate-id';

export function createDataTypeSelectorElement() {
  return {
    id: generateId(),
    type: 'dataTypeSelector',
  };
}

export function createDataTypeElement(dataType) {
  const config = {
    dataType,
  };

  if (dataType === 'array') {
    config.item = createDataTypeSelectorElement();
  }

  return {
    id: generateId(),
    type: 'dataType',
    config,
  };
}
