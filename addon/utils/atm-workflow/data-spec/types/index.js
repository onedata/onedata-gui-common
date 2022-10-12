/**
 * Contains general typedefs, data and functions related to automation data specs types.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { atmDataSpecTypeDefinition as integerTypeDefinition } from './integer';
import { atmDataSpecTypeDefinition as stringTypeDefinition } from './string';
import { atmDataSpecTypeDefinition as objectTypeDefinition } from './object';
import { atmDataSpecTypeDefinition as fileTypeDefinition } from './file';
import { atmDataSpecTypeDefinition as datasetTypeDefinition } from './dataset';
import { atmDataSpecTypeDefinition as rangeTypeDefinition } from './range';
import { atmDataSpecTypeDefinition as arrayTypeDefinition } from './array';
import { atmDataSpecTypeDefinition as timeSeriesMeasurementTypeDefinition } from './time-series-measurement';
import { atmDataSpecTypeDefinition as onedataFsCredentialsTypeDefinition } from './onedatafs-credentials';

/**
 * @typedef {
 *   AtmDatasetDataSpec |
 *   AtmFileDataSpec |
 *   AtmIntegerDataSpec |
 *   AtmObjectDataSpec |
 *   AtmOnedatafsCredentialsDataSpec |
 *   AtmRangeDataSpec |
 *   AtmStringDataSpec |
 *   AtmTimeSeriesMeasurementDataSpec
 * } AtmLeafDataSpec
 */

/**
 * @typedef {AtmArrayDataSpec} AtmContainerDataSpec
 */

/**
 * @typedef {
 *   AtmLeafDataSpec |
 *   AtmContainerDataSpec
 * } AtmDataSpec
 */

/**
 * @typedef {'integer'|'string'|'object'|'file'|'dataset'|'range'|'array'|'timeSeriesMeasurement'|'onedatafsCredentials'} AtmDataSpecType
 */

/**
 * @type {Array<AtmDataSpecType>}
 */
export const dataSpecTypes = Object.freeze([
  'integer',
  'string',
  'object',
  'file',
  'dataset',
  'range',
  'array',
  'timeSeriesMeasurement',
  'onedatafsCredentials',
]);

/**
 * @type {Object<AtmDataSpecType, AtmDataSpecTypeDefinition>}
 */
const atmDataSpecTypeDefinitions = Object.freeze({
  integer: integerTypeDefinition,
  string: stringTypeDefinition,
  object: objectTypeDefinition,
  file: fileTypeDefinition,
  dataset: datasetTypeDefinition,
  range: rangeTypeDefinition,
  array: arrayTypeDefinition,
  timeSeriesMeasurement: timeSeriesMeasurementTypeDefinition,
  onedatafsCredentials: onedataFsCredentialsTypeDefinition,
});

/**
 * @type {Object<AtmDataSpecType, Array<AtmDataSpecType>>}
 */
const atmDataSpecTypeSubtypes = Object.freeze(
  dataSpecTypes.reduce((acc, dataSpecType) => {
    acc[dataSpecType] = acc[dataSpecType] ?? [];
    atmDataSpecTypeDefinitions[dataSpecType].superTypes.forEach((superType) => {
      acc[superType] = acc[superType] ?? [];
      acc[superType].push(dataSpecType);
    });
    return acc;
  }, {})
);

/**
 * @param {AtmDataSpecType} atmDataSpecType
 * @returns {Array<AtmDataSpecType>}
 */
export function getAtmDataSpecTypeSupertypes(atmDataSpecType) {
  return atmDataSpecTypeDefinitions[atmDataSpecType]?.superTypes ?? [];
}

/**
 * @param {AtmDataSpecType} atmDataSpecType
 * @returns {Array<AtmDataSpecType>}
 */
export function getAtmDataSpecTypeSubtypes(atmDataSpecType) {
  return atmDataSpecTypeSubtypes[atmDataSpecType] ?? [];
}

/**
 * @param {T extends AtmDataSpecType} atmDataSpecType
 * @param {Array<AtmDataSpecFilter>} filters
 * @returns {ReturnType<(typeof atmDataSpecTypeDefinitions)[T]['getValueConstraintsConditions']>|null}
 */
export function getAtmValueConstraintsConditions(atmDataSpecType, filters) {
  return atmDataSpecTypeDefinitions[atmDataSpecType]
    ?.getValueConstraintsConditions?.(filters) ?? null;
}

/**
 * @param {AtmDataSpecType} atmDataSpec
 * @param {Array<AtmDataSpecFilter>} filters
 * @returns {boolean}
 */
export function isAtmDataSpecMatchingFilters(atmDataSpec, filters) {
  const context = {
    canDataSpecContain,
    isAtmDataSpecMatchingFilters,
  };
  return atmDataSpecTypeDefinitions[atmDataSpec?.type]
    ?.isMatchingFilters?.(atmDataSpec, filters, context) ?? null;
}

/**
 * @param {Ember.Service} i18n
 * @param {AtmDataSpecType} dataSpecType
 * @returns {SafeString}
 */
export function translateDataSpecType(i18n, dataSpecType) {
  const i18nPath = dataSpecType &&
    `utils.atmWorkflow.dataSpec.types.${dataSpecType}`;
  return i18nPath ? i18n.t(i18nPath, {}, { defaultValue: '' }) : '';
}

/**
 * @typedef {Object} CanDataSpecContainFunctionContext
 * @property {(containerDataSpec: AtmDataSpec, toContainDataSpec: AtmDataSpec, ignoreEmpty: boolean) => boolean} canDataSpecContain
 */

/**
 * @typedef {Object} AtmDataSpecTypeDefinition<T,U>
 * @property {Array<AtmDataSpecType>} superTypes
 * @property {(containerConstraints: T, toContainConstraints: T, ignoreEmpty: boolean, context: CanValueConstraintsContainFunctionContext) => boolean} canValueConstraintsContain
 * @property {(filters: Array<AtmDataSpecFilter>) => U)} getValueConstraintsConditions
 * @property {(atmDataSpec: AtmDataSpec, filters: Array<AtmDataSpecFilter>, context: IsAtmDataSpecMatchingFiltersGenericFunctionContext) => boolean} isMatchingFilters
 */

/**
 * Returns true, when data fulfilling `toContainDataSpec` can be persisted
 * inside data container fulfilling `containerDataSpec`.
 *
 * @param {AtmDataSpec} containerDataSpec
 * @param {AtmDataSpec} toContainDataSpec
 * @param {boolean} [ignoreEmpty]
 * @returns {boolean}
 */
export function canDataSpecContain(
  containerDataSpec,
  toContainDataSpec,
  ignoreEmpty = false,
) {
  if (!containerDataSpec?.type || !toContainDataSpec?.type) {
    return ignoreEmpty;
  }

  const context = { canDataSpecContain };
  if (containerDataSpec.type === toContainDataSpec.type) {
    if (containerDataSpec.type in atmDataSpecTypeDefinitions) {
      const atmDataSpecDefinition = atmDataSpecTypeDefinitions[containerDataSpec.type];
      return atmDataSpecDefinition.canValueConstraintsContain(
        containerDataSpec.valueConstraints,
        toContainDataSpec.valueConstraints,
        ignoreEmpty,
        context
      );
    } else {
      return true;
    }
  } else {
    return atmDataSpecTypeDefinitions[toContainDataSpec.type].superTypes
      .includes(containerDataSpec.type) || false;
  }
}
