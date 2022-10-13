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
import { atmDataSpecTypeDefinition as onedatafsCredentialsTypeDefinition } from './onedatafs-credentials';

export { getMatchingAtmDataSpecTypes } from '../filters';

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
 * @type {Object<string, AtmDataSpecType>}
 */
export const AtmDataSpecType = Object.freeze({
  Integer: 'integer',
  String: 'string',
  Object: 'object',
  File: 'file',
  Dataset: 'dataset',
  Range: 'range',
  Array: 'array',
  TimeSeriesMeasurement: 'timeSeriesMeasurement',
  OnedatafsCredentials: 'onedatafsCredentials',
});

/**
 * @type {Array<AtmDataSpecType>}
 */
export const atmDataSpecTypesArray = Object.freeze([
  AtmDataSpecType.Integer,
  AtmDataSpecType.String,
  AtmDataSpecType.Object,
  AtmDataSpecType.File,
  AtmDataSpecType.Dataset,
  AtmDataSpecType.Range,
  AtmDataSpecType.Array,
  AtmDataSpecType.TimeSeriesMeasurement,
  AtmDataSpecType.OnedatafsCredentials,
]);

/**
 * @typedef {Object} AtmDataSpecTypeDefinition<T,U>
 * @property {AtmDataSpecType|null} supertype
 * @property {(containerConstraints: T, toContainConstraints: T, ignoreEmpty: boolean, context: CanValueConstraintsContainFunctionContext) => boolean} canValueConstraintsContain
 * @property {(filters: Array<AtmDataSpecFilter>) => U)} getValueConstraintsConditions
 * @property {(atmDataSpec: AtmDataSpec, filters: Array<AtmDataSpecFilter>, context: IsAtmDataSpecMatchingFiltersGenericFunctionContext) => boolean} isMatchingFilters
 */

/**
 * @typedef {Object} CanValueConstraintsContainFunctionContext
 * @property {(containerAtmDataSpec: AtmDataSpec, toContainAtmDataSpec: AtmDataSpec, ignoreEmpty: boolean) => boolean} canAtmDataSpecContain
 */

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
  onedatafsCredentials: onedatafsCredentialsTypeDefinition,
});

/**
 * @param {AtmDataSpecType} atmDataSpecType
 * @returns {Array<AtmDataSpecType>}
 */
export function getAtmDataSpecTypeSupertypes(atmDataSpecType) {
  const foundSupertypes = [];
  const typesToGetSupertypes = [atmDataSpecType];
  while (typesToGetSupertypes.length) {
    const typeToCheck = typesToGetSupertypes.pop();
    const supertype = atmDataSpecTypeDefinitions[typeToCheck].supertype;
    if (supertype) {
      foundSupertypes.push(supertype);
      typesToGetSupertypes.push(supertype);
    }
  }
  return foundSupertypes;
}

/**
 * @param {AtmDataSpecType} atmDataSpecType
 * @returns {Array<AtmDataSpecType>}
 */
export function getAtmDataSpecTypeSubtypes(atmDataSpecType) {
  const foundSubtypes = [];
  const typesToGetSubtypes = [atmDataSpecType];
  while (typesToGetSubtypes.length) {
    const typeToCheck = typesToGetSubtypes.pop();
    const subtypes = Object.keys(atmDataSpecTypeDefinitions)
      .filter((type) => atmDataSpecTypeDefinitions[type].supertype === typeToCheck);
    if (subtypes.length) {
      foundSubtypes.push(...subtypes);
      typesToGetSubtypes.push(...subtypes);
    }
  }
  return foundSubtypes;
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
    canAtmDataSpecContain,
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
export function translateAtmDataSpecType(i18n, dataSpecType) {
  const i18nPath = dataSpecType &&
    `utils.atmWorkflow.dataSpec.types.${dataSpecType}`;
  return i18nPath ? i18n.t(i18nPath) : '';
}

/**
 * Returns true, when data fulfilling `toContainAtmDataSpec` can be persisted
 * inside data container fulfilling `containerAtmDataSpec`.
 *
 * @param {AtmDataSpec} containerAtmDataSpec
 * @param {AtmDataSpec} toContainAtmDataSpec
 * @param {boolean} [ignoreEmpty]
 * @returns {boolean}
 */
export function canAtmDataSpecContain(
  containerAtmDataSpec,
  toContainAtmDataSpec,
  ignoreEmpty = false,
) {
  if (!containerAtmDataSpec?.type || !toContainAtmDataSpec?.type) {
    return ignoreEmpty;
  }

  const context = { canAtmDataSpecContain };
  if (containerAtmDataSpec.type === toContainAtmDataSpec.type) {
    if (containerAtmDataSpec.type in atmDataSpecTypeDefinitions) {
      const atmDataSpecDefinition = atmDataSpecTypeDefinitions[containerAtmDataSpec.type];
      return atmDataSpecDefinition.canValueConstraintsContain(
        containerAtmDataSpec.valueConstraints,
        toContainAtmDataSpec.valueConstraints,
        ignoreEmpty,
        context
      );
    } else {
      return true;
    }
  } else {
    return getAtmDataSpecTypeSupertypes(toContainAtmDataSpec.type)
      .includes(containerAtmDataSpec.type);
  }
}
