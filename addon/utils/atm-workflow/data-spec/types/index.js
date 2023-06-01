/**
 * Contains general typedefs, data and functions related to automation data specs types.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { atmDataSpecTypeDefinition as numberTypeDefinition } from './number';
import { atmDataSpecTypeDefinition as booleanTypeDefinition } from './boolean';
import { atmDataSpecTypeDefinition as stringTypeDefinition } from './string';
import { atmDataSpecTypeDefinition as objectTypeDefinition } from './object';
import { atmDataSpecTypeDefinition as fileTypeDefinition } from './file';
import { atmDataSpecTypeDefinition as datasetTypeDefinition } from './dataset';
import { atmDataSpecTypeDefinition as rangeTypeDefinition } from './range';
import { atmDataSpecTypeDefinition as arrayTypeDefinition } from './array';
import { atmDataSpecTypeDefinition as timeSeriesMeasurementTypeDefinition } from './time-series-measurement';

/**
 * @typedef {
 *   AtmDatasetDataSpec |
 *   AtmFileDataSpec |
 *   AtmNumberDataSpec |
 *   AtmBooleanDataSpec |
 *   AtmObjectDataSpec |
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
 * @typedef {'number'|'boolean'|'string'|'object'|'file'|'dataset'|'range'|'array'|'timeSeriesMeasurement'} AtmDataSpecType
 */

/**
 * @type {Object<string, AtmDataSpecType>}
 */
export const AtmDataSpecType = Object.freeze({
  Number: 'number',
  Boolean: 'boolean',
  String: 'string',
  Object: 'object',
  File: 'file',
  Dataset: 'dataset',
  Range: 'range',
  Array: 'array',
  TimeSeriesMeasurement: 'timeSeriesMeasurement',
});

/**
 * @type {Array<AtmDataSpecType>}
 */
export const atmDataSpecTypesArray = Object.freeze([
  AtmDataSpecType.Number,
  AtmDataSpecType.Boolean,
  AtmDataSpecType.String,
  AtmDataSpecType.Object,
  AtmDataSpecType.File,
  AtmDataSpecType.Dataset,
  AtmDataSpecType.Range,
  AtmDataSpecType.Array,
  AtmDataSpecType.TimeSeriesMeasurement,
]);

/**
 * @typedef {Object} AtmDataSpecParamsConditions
 * Contains possible values and/or limitations for data spec params.
 * These can be later used by data spec editors editors to provide
 * autocompletion and validation, especially when there are some filters applied
 * and only a subset of the possible values is correct.
 *
 * Conditions format is different for each data spec type. For the majority of
 * types there are no specific conditions as there are no additional params
 * available.
 */

/**
 * @typedef {Object} AtmDataSpecTypeDefinition<T extends AtmDataSpec, U extends AtmDataSpecParamsConditions>
 * @property {AtmDataSpecType|null} supertype The nearest supertype (type from
 * which this type derives) of this type. `null` when this type has
 * no supertype.
 * @property {(referenceAtmDataSpec: T, typeOrSubtypeAtmDataSpec: T, ignoreEmpty: boolean, context: AreAtmDataSpecParamsCompatibleFuncCtx) => boolean} areAtmDataSpecParamsCompatible
 * Returns `true` when `typeOrSubtypeAtmDataSpec` data spec limits
 * allowed values at least as much as `referenceAtmDataSpec` data spec
 * does. Practically it means that when this function returns `true`, then it is
 * always possible to assign any data fulfilling `typeOrSubtypeAtmDataSpec` to
 * an entity constrained by `referenceAtmDataSpec`.
 * When `ignoreEmpty` is `true`, then a lack of some params specification
 * is ignored and does not affect compatibility check. Only directly defined
 * incompatibilities will make function to return `false`.
 * @property {(filters: Array<AtmDataSpecFilter>) => U} getAtmDataSpecParamsConditions
 * Converts passed filters to an object with possible values and/or limitations
 * for data spec properties. See more: `AtmDataSpecParamsConditions`
 * @property {(atmDataSpec: AtmDataSpec, filters: Array<AtmDataSpecFilter>, context: IsAtmDataSpecParamsMatchingFiltersFuncCtx) => boolean} isAtmDataSpecParamsMatchingFilters
 * Returns `true` when specific data spec params fulfill all provided filters.
 * @property {(atmDataSpec: AtmDataSpec) => unknown} getDefaultValue Returns
 * value default for this data type. WARNING: It doesn't have to be a valid
 * value! It represents a value being as close as possible to the simplest
 * valid value.
 */

/**
 * @typedef {Object} AreAtmDataSpecParamsCompatibleFuncCtx
 * @property {(containerAtmDataSpec: AtmDataSpec, toContainAtmDataSpec: AtmDataSpec, ignoreEmpty: boolean) => boolean} isAtmDataSpecCompatible
 */

/**
 * @typedef {Object} IsAtmDataSpecParamsMatchingFiltersFuncCtx
 * @property {(atmDataSpec: AtmDataSpec, filters: Array<AtmDataSpecFilter>) => boolean} isAtmDataSpecMatchingFilters
 */

/**
 * @type {Object<AtmDataSpecType, AtmDataSpecTypeDefinition>}
 */
export const atmDataSpecTypeDefinitions = Object.freeze({
  number: numberTypeDefinition,
  boolean: booleanTypeDefinition,
  string: stringTypeDefinition,
  object: objectTypeDefinition,
  file: fileTypeDefinition,
  dataset: datasetTypeDefinition,
  range: rangeTypeDefinition,
  array: arrayTypeDefinition,
  timeSeriesMeasurement: timeSeriesMeasurementTypeDefinition,
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
 * @returns {ReturnType<(typeof atmDataSpecTypeDefinitions)[T]['areAtmDataSpecParamsCompatible']>|null}
 */
export function getAtmDataSpecParamsConditions(atmDataSpecType, filters) {
  return atmDataSpecTypeDefinitions[atmDataSpecType]
    ?.getAtmDataSpecParamsConditions?.(filters) ?? null;
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
 * Returns `true` when `typeOrSubtypeAtmDataSpec` data spec is of type or is
 * a subtype of `referenceAtmDataSpec` data spec. Practically it means that
 * when this function returns `true`, then it is always possible to assign any
 * data of type `typeOrSubtypeAtmDataSpec` to an entity typed as
 * `referenceAtmDataSpec`.
 *
 * @param {AtmDataSpec} referenceAtmDataSpec
 * @param {AtmDataSpec} typeOrSubtypeAtmDataSpec
 * @param {boolean} [ignoreEmpty] When true, then a lack of type specification
 * (e.g. incomplete params) is ignored and does not affect
 * compatibility check. Only directly defined incompatibilities will make
 * function to return `false`.
 * @returns {boolean}
 */
export function isAtmDataSpecCompatible(
  referenceAtmDataSpec,
  typeOrSubtypeAtmDataSpec,
  ignoreEmpty = false,
) {
  if (!referenceAtmDataSpec?.type || !typeOrSubtypeAtmDataSpec?.type) {
    return ignoreEmpty;
  }

  const context = { isAtmDataSpecCompatible };
  if (referenceAtmDataSpec.type === typeOrSubtypeAtmDataSpec.type) {
    if (referenceAtmDataSpec.type in atmDataSpecTypeDefinitions) {
      const atmDataSpecDefinition = atmDataSpecTypeDefinitions[referenceAtmDataSpec.type];
      return atmDataSpecDefinition.areAtmDataSpecParamsCompatible(
        referenceAtmDataSpec,
        typeOrSubtypeAtmDataSpec,
        ignoreEmpty,
        context
      );
    } else {
      return true;
    }
  } else {
    return getAtmDataSpecTypeSupertypes(typeOrSubtypeAtmDataSpec.type)
      .includes(referenceAtmDataSpec.type);
  }
}

/**
 * Returns value default for provided data spec. WARNING: It doesn't have to be
 * a valid value! It represents a value being as close as possible to the
 * simplest valid value. For some types (e.g. file) it's not possible to
 * generate an always-valid default value.
 * @param {AtmDataSpec} atmDataSpec
 * @returns {unknown}
 */
export function getDefaultValueForAtmDataSpec(atmDataSpec) {
  return atmDataSpecTypeDefinitions[atmDataSpec?.type]
    ?.getDefaultValue?.(atmDataSpec) ?? null;
}
