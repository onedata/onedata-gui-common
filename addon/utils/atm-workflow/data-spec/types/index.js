/**
 * Contains general typedefs, data and functions related to automation data specs types.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { canValueConstraintsContain as canFileValueConstraintsContain } from './file';

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
  if (
    !containerDataSpec ||
    !containerDataSpec.type ||
    !toContainDataSpec ||
    !toContainDataSpec.type
  ) {
    return ignoreEmpty;
  }

  if (
    containerDataSpec.type === 'array' &&
    toContainDataSpec.type === 'array'
  ) {
    return canDataSpecContain(
      get(containerDataSpec, 'valueConstraints.itemDataSpec'),
      get(toContainDataSpec, 'valueConstraints.itemDataSpec'),
      ignoreEmpty
    );
  } else if (containerDataSpec.type === toContainDataSpec.type) {
    if (containerDataSpec.type === 'file') {
      return canFileValueConstraintsContain(
        containerDataSpec.valueConstraints,
        toContainDataSpec.valueConstraints,
        ignoreEmpty
      );
    } else {
      return true;
    }
  } else {
    return (dataSpecSupertypes[toContainDataSpec.type] || [])
      .includes(containerDataSpec.type);
  }
}
