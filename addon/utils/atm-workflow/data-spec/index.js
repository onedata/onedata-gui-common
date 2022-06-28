/**
 * Contains general typedefs related to automation data specs
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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

export const dataSpecSupertypes = Object.freeze({
  integer: [],
  string: [],
  object: [],
  file: ['object'],
  dataset: ['object'],
  range: ['object'],
  array: [],
  timeSeriesMeasurement: ['object'],
  onedatafsCredentials: ['object'],
});

export const dataSpecSubtypes = Object.freeze(
  dataSpecTypes.reduce((acc, dataSpecType) => {
    acc[dataSpecType] = acc[dataSpecType] || [];
    dataSpecSupertypes[dataSpecType].forEach((superType) => {
      acc[superType] = acc[superType] || [];
      acc[superType].push(dataSpecType);
    });
    return acc;
  }, {})
);

/**
 * @param {Ember.Service} i18n
 * @param {string} dataSpecType
 * @returns {SafeString}
 */
export function translateDataSpecType(i18n, dataSpecType) {
  const i18nPath = dataSpecType &&
    `utils.atmWorkflow.dataSpec.types.${dataSpecType}`;
  return i18nPath ? i18n.t(i18nPath, {}, { defaultValue: '' }) : '';
}
