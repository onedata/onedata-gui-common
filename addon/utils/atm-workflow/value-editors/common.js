/**
 * Common utilities for value editors.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';

/**
 * @type {string}
 */
export const editorComponentsPrefix = 'atm-workflow/value-editors';

/**
 * @type {string}
 */
const defaultArrayItemCreatorComponentName = `${editorComponentsPrefix}/array/default-item-creator`;

/**
 * @type {Object<AtmDataSpecType, string>}
 */
const customArrayItemCreatorComponentNames = Object.freeze({
  [AtmDataSpecType.File]: `${editorComponentsPrefix}/file/array-item-creator`,
  [AtmDataSpecType.Dataset]: `${editorComponentsPrefix}/dataset/array-item-creator`,
});

/**
 * @param {AtmDataSpec} itemAtmDataSpec
 * @returns {string}
 */
export function getArrayItemCreatorComponentName(itemAtmDataSpec) {
  return customArrayItemCreatorComponentNames[itemAtmDataSpec?.type] ??
    defaultArrayItemCreatorComponentName;
}

/**
 * @typedef {AtmValuePresenterContext} AtmValueEditorContext
 * @property {(selectorConfig: FilesSelectorConfig) => void} [selectFiles]
 * @property {(selectorConfig: DatasetsSelectorConfig) => void} [selectDatasets]
 */

/**
 * @typedef {Object} FilesSelectorConfig
 * @property {AtmFileType} atmFileType
 * @property {boolean} allowMany
 * @property {() => Array<AtmFile>} onSelected
 * @property {() => void} onCancelled
 */

/**
 * @typedef {Object} DatasetsSelectorConfig
 * @property {boolean} allowMany
 * @property {() => Array<AtmDataset>} onSelected
 * @property {() => void} onCancelled
 */
