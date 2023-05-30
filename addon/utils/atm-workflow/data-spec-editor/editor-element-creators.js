/**
 * Provides functions for creating object representations of data spec editor elements.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import generateId from 'onedata-gui-common/utils/generate-id';
import paramsEditors from 'onedata-gui-common/utils/atm-workflow/data-spec-editor/params-editors';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';

/**
 * @returns {DataSpecEditorDataTypeSelector}
 */
export function createDataTypeSelectorElement(config = {}) {
  const completeConfig = Object.assign({ includeExpandParams: false }, config);
  return {
    id: generateId(),
    type: 'dataTypeSelector',
    config: completeConfig,
  };
}

/**
 * @param {string} dataType every possible data spec type is allowed
 * @param {Partial<DataSpecEditorDataTypeConfig>}
 * @returns {DataSpecEditorDataType}
 */
export function createDataTypeElement(dataType, config = {}) {
  const completeConfig = Object.assign({ includeExpandParams: false }, config, {
    dataType,
  });

  if (dataType === 'array' && !completeConfig.item) {
    completeConfig.item = createDataTypeSelectorElement({
      includeExpandParams: completeConfig.includeExpandParams,
    });
  }

  if (dataType in paramsEditors && !completeConfig.formValues) {
    completeConfig.formValues = createValuesContainer({
      dataTypeEditor: paramsEditors[dataType]
        .atmDataSpecParamsToFormValues(null, completeConfig.includeExpandParams),
    });
  }

  return {
    id: generateId(),
    type: 'dataType',
    config: completeConfig,
  };
}
