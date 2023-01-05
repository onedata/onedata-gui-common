/**
 * Exports generic automation values validator. Work for any type of
 * data spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { AtmDataSpecType } from 'onedata-gui-common/utils/atm-workflow/data-spec/types';
import validateArray from './array';
import validateBoolean from './boolean';
import validateDataset from './dataset';
import validateFile from './file';
import validateInteger from './integer';
import validateObject from './object';
import validateRange from './range';
import validateString from './string';
import validateTimeSeriesMeasurement from './time-series-measurement';

/**
 * @type {Object<AtmDataSpecType, AtmValueValidator>}
 */
const validators = Object.freeze({
  [AtmDataSpecType.Array]: validateArray,
  [AtmDataSpecType.Boolean]: validateBoolean,
  [AtmDataSpecType.Dataset]: validateDataset,
  [AtmDataSpecType.File]: validateFile,
  [AtmDataSpecType.Integer]: validateInteger,
  [AtmDataSpecType.Object]: validateObject,
  [AtmDataSpecType.Range]: validateRange,
  [AtmDataSpecType.String]: validateString,
  [AtmDataSpecType.TimeSeriesMeasurement]: validateTimeSeriesMeasurement,
});

/**
 * @param {unknown} value
 * @param {AtmDataSpec} atmDataSpec
 * @returns {boolean} True if passed value is suitable for `atmDataSpec`.
 */
export default function validate(value, atmDataSpec) {
  const validator = validators[atmDataSpec?.type];
  if (!validator) {
    return false;
  }

  const validatorContext = Object.freeze({
    validateNestedValue: validate,
  });
  return validator(value, atmDataSpec, validatorContext);
}
