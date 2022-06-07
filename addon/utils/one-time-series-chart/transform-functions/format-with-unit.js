/**
 * A transform function, which formats given value according to specified unit.
 *
 * Arguments:
 * - `data` - must be of type:
 *     - number,
 *     - array of numbers,
 *     - transform function that will evaluate to one of above types.
 * - `unitName` - must be of type:
 *     - UnitName,
 *     - transform function that will evaluate to UnitName.
 * - `unitOptions` - must be of type (depending on used `unitName`):
 *     - BytesUnitOptions,
 *     - BitsUnitFormat,
 *     - CustomUnitOptions,
 *     - transform function that will evaluate to one of above types.
 *
 *
 * If some argument is a transform function, it is evaluated before further processing.
 *
 * In case of a single number in `data` the function will return its stringified value
 * in a format appropriate for a choosen unit.
 * Example: `1024` -> `'1 KiB'` (when `unitName` is `'bytes'`).
 * In case of an array of numbers in `data` the function will return an array with
 * stringified values in a format appropriate for a choosen unit for each number
 * from the argument. Example:
 * `[1024, 2048]` -> `['1 KiB', '2 KiB']` (when `unitName` is `'bytes'`).
 * In case of any non-number value (also in array), it will be converted to null. *
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import stringifyDuration from 'onedata-gui-common/utils/i18n/stringify-duration';
import getNumberMetricSuffix from 'onedata-gui-common/utils/get-number-metric-suffix';
import _ from 'lodash';

/**
 * @typedef {Object} OTSCFormatWithUnitTransformFunctionArguments
 * @property {OTSCRawFunction|number|Array<number>} data
 * @property {OTSCRawFunction|UnitName|undefined|null} unitName
 * @property {OTSCRawFunction|BytesUnitOptions|BitsUnitFormat|CustomUnitOptions|undefined|null} unitOptions
 */

/**
 * @typedef {
 *   'none' |
 *   'milliseconds' |
 *   'seconds' |
 *   'bits' |
 *   'bytes' |
 *   'hertz' |
 *   'countsPerSec' |
 *   'bitsPerSec' |
 *   'bytesPerSec' |
 *   'operationsPerSec' |
 *   'requestsPerSec' |
 *   'readsPerSec' |
 *   'writesPerSec' |
 *   'ioOperationsPerSec' |
 *   'percent' |
 *   'percentNormalized' |
 *   'boolean' |
 *   'custom'
 * } UnitName
 */

/**
 * @typedef {Object} BytesUnitOptions
 * @property {'si'|'iec'} format
 */

/**
 * @typedef {BytesUnitOptions} BitsUnitOptions
 */

/**
 * @typedef {Object} CustomUnitOptions
 * @property {string} customName will be used as a unit rendered after number value.
 * E.g. for 'liters' it will be "10 liters"
 * @property {boolean} useMetricSuffix defines whether or not large values should
 * be shortened using metric suffix (like 1000000 -> 1M)
 */

const unitSuffixes = {
  hertz: 'Hz',
  countsPerSec: 'c/s',
  operationsPerSec: 'ops/s',
  requestsPerSec: 'req/s',
  readsPerSec: 'rd/s',
  writesPerSec: 'wr/s',
  ioOperationsPerSec: 'io/s',
};

/**
 * @param {OTSCTransformFunctionContext} context
 * @param {OTSCFormatWithUnitTransformFunctionArguments} args
 * @returns {string|null|Array<string|null>}
 */
export default function formatWithUnit(context, args) {
  if (!args) {
    return null;
  }

  const data = context.evaluateTransformFunction(context, args.data);
  const dataIsArray = Array.isArray(data);
  const dataAsArray = dataIsArray ? data : [data];
  const unitName = context.evaluateTransformFunction(context, args.unitName);
  const unitOptions = context.evaluateTransformFunction(context, args.unitOptions);

  const resultArray = dataAsArray.map((value) => {
    if (!Number.isFinite(value)) {
      return null;
    }
    switch (unitName) {
      case 'milliseconds':
      case 'seconds': {
        const normalizedValue = unitName === 'milliseconds' ? value / 1000 : value;
        // For single milliseconds and fractional seconds `stringifyDuration` is not
        // precise enough.
        if (Math.abs(normalizedValue) < 1) {
          return `${Math.floor(normalizedValue * 1000)} ms`;
        } else if (Math.abs(normalizedValue) < 60) {
          return `${Math.floor(normalizedValue * 10) / 10} sec`;
        }

        let durationString = stringifyDuration(normalizedValue, {
          shortFormat: true,
          showIndividualSeconds: true,
        });
        if (value < 0) {
          durationString = `-${durationString}`;
        }
        return durationString;
      }
      case 'bits':
      case 'bytes':
      case 'bitsPerSec':
      case 'bytesPerSec': {
        const isPerSec = unitName === 'bytesPerSec' || unitName === 'bitsPerSec';
        const areBits = unitName === 'bits' || unitName === 'bitsPerSec';
        const formatFromOptions = unitOptions && (
          unitOptions.format === 'iec' || unitOptions.format === 'si'
        ) ? unitOptions.format : 'iec';
        const bytesToStringOptions = {
          format: areBits ? `bit${_.upperFirst(formatFromOptions)}` : formatFromOptions,
        };
        const stringifiedValue = bytesToString(
          areBits ? value / 8 : value,
          bytesToStringOptions
        );
        return isPerSec ? `${stringifiedValue}/s` : stringifiedValue;
      }
      case 'hertz': {
        const { suffixedNumber, prefixForUnit } = getNumberMetricSuffix(value);
        return `${suffixedNumber} ${prefixForUnit}${unitSuffixes[unitName]}`;
      }
      case 'countsPerSec':
      case 'operationsPerSec':
      case 'requestsPerSec':
      case 'readsPerSec':
      case 'writesPerSec':
      case 'ioOperationsPerSec': {
        const { formattedString } = getNumberMetricSuffix(value);
        return `${formattedString} ${unitSuffixes[unitName]}`;
      }
      case 'percent':
      case 'percentNormalized': {
        const percentNumber = unitName === 'percentNormalized' ? value * 100 : value;
        return `${percentNumber}%`;
      }
      case 'boolean':
        return value === 0 ? 'False' : 'True';
      case 'custom': {
        const stringifiedValue = unitOptions && unitOptions.useMetricSuffix === true ?
          getNumberMetricSuffix(value).formattedString : String(value);
        const customUnitName = unitOptions &&
          unitOptions.customName &&
          typeof unitOptions.customName === 'string' ?
          unitOptions.customName : '';
        return `${stringifiedValue}${customUnitName ? ' ' + customUnitName : ''}`;
      }
      default:
        return String(value);
    }
  });

  return dataIsArray ? resultArray : resultArray[0];
}
