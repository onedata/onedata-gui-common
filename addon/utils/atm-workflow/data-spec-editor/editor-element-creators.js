/**
 * Provides functions for creating object representations of data spec editor elements.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import generateId from 'onedata-gui-common/utils/generate-id';
import valueConstraintsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/value-constraints-editors';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

/**
 * @returns {DataSpecEditorDataTypeSelector}
 */
export function createDataTypeSelectorElement() {
  return {
    id: generateId(),
    type: 'dataTypeSelector',
  };
}

/**
 * @param {string} dataType every possible data spec type is allowed
 * @param {Partial<DataSpecEditorDataTypeConfig>}
 * @returns {DataSpecEditorDataType}
 */
export function createDataTypeElement(dataType, config = {}) {
  const completeConfig = Object.assign({}, config, {
    dataType,
  });

  if (dataType === 'array' && !completeConfig.item) {
    completeConfig.item = createDataTypeSelectorElement();
  }

  if (dataType in valueConstraintsEditors && !completeConfig.formValues) {
    completeConfig.formValues = createValuesContainer({
      dataTypeEditor: valueConstraintsEditors[dataType]
        .valueConstraintsToFormValues(null),
    });
  }

  return {
    id: generateId(),
    type: 'dataType',
    config: completeConfig,
  };
}
