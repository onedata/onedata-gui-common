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

import { get } from '@ember/object';
import { canValueConstraintsContain as canFileValueConstraintsContain } from './file';

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
 * @param {AtmDataSpec} targetDataSpec
 * @param {AtmDataSpec} sourceDataSpec
 * @param {boolean} [ignoreEmpty]
 * @returns {boolean}
 */
export function canDataSpecContain(targetDataSpec, sourceDataSpec, ignoreEmpty = false) {
  if (
    !targetDataSpec ||
    !targetDataSpec.type ||
    !sourceDataSpec ||
    !sourceDataSpec.type
  ) {
    return ignoreEmpty;
  }

  if (targetDataSpec.type === 'array' && sourceDataSpec.type === 'array') {
    return canDataSpecContain(
      get(targetDataSpec, 'valueConstraints.itemDataSpec'),
      get(sourceDataSpec, 'valueConstraints.itemDataSpec'),
      ignoreEmpty
    );
  } else if (targetDataSpec.type === sourceDataSpec.type) {
    if (targetDataSpec.type === 'file') {
      return canFileValueConstraintsContain(
        targetDataSpec.valueConstraints,
        sourceDataSpec.valueConstraints,
        ignoreEmpty
      );
    } else {
      return true;
    }
  } else {
    return (dataSpecSupertypes[sourceDataSpec.type] || []).includes(targetDataSpec.type);
  }
}

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
