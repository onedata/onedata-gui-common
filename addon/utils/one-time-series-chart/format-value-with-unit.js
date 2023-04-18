/**
 * A transform function, which formats given value according to specified unit.
 *
 * Arguments:
 * - `data` - must be of type number.
 * - `unitName` - must be of type UnitName.
 * - `unitOptions` - must be of type (depending on used `unitName`):
 *     - BytesUnitOptions,
 *     - BitsUnitFormat,
 *     - CustomUnitOptions.
 *
 * The function will return stringified number in a format appropriate for a choosen unit.
 * In case of any non-number value, it will be converted to null.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { htmlSafe } from '@ember/string';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';
import stringifyDuration from 'onedata-gui-common/utils/i18n/stringify-duration';
import getNumberMetricSuffix from 'onedata-gui-common/utils/get-number-metric-suffix';
import { formatNumber } from 'onedata-gui-common/helpers/format-number';
import _ from 'lodash';

/**
 * @typedef {Object} OTSCFormatValueWithUnitFunctionArguments
 * @property {number} value
 * @property {UnitName|undefined|null} unitName
 * @property {BytesUnitOptions|BitsUnitFormat|CustomUnitOptions|undefined|null} unitOptions
 * @property {boolean} [allowHtml]
 */

/**
 * @typedef {TimeSeriesStandardUnit|'custom'} UnitName
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
 * @param {OTSCFormatValueWithUnitFunctionArguments} args
 * @returns {string|null}
 */
export default function formatValueWithUnit(args) {
  if (!args) {
    return null;
  }
  const {
    value,
    unitName,
    unitOptions,
    allowHtml = true,
  } = args;

  if (!Number.isFinite(value)) {
    return null;
  }

  const formatNumericMeasurement = (value) => {
    // Use thousand separating space and up to 3 fractional digits precision
    return String(formatNumber(value, { format: '# ##0.###', allowHtml }));
  };

  let result;
  switch (unitName) {
    case 'milliseconds':
    case 'seconds': {
      const normalizedValue = unitName === 'milliseconds' ? value / 1000 : value;
      // For single milliseconds and fractional seconds `stringifyDuration` is not
      // precise enough.
      if (Math.abs(normalizedValue) < 1) {
        result = `${Math.floor(normalizedValue * 1000)} ms`;
        break;
      } else if (Math.abs(normalizedValue) < 60) {
        result = `${Math.floor(normalizedValue * 10) / 10} sec`;
        break;
      }

      let durationString = stringifyDuration(normalizedValue, {
        shortFormat: true,
        showIndividualSeconds: true,
      });
      if (value < 0) {
        durationString = `-${durationString}`;
      }
      result = durationString;
      break;
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
      result = isPerSec ? `${stringifiedValue}/s` : stringifiedValue;
      break;
    }
    case 'hertz': {
      const { suffixedNumber, prefixForUnit } = getNumberMetricSuffix(value);
      result = `${formatNumericMeasurement(suffixedNumber)} ${prefixForUnit}${unitSuffixes[unitName]}`;
      break;
    }
    case 'countsPerSec':
    case 'operationsPerSec':
    case 'requestsPerSec':
    case 'readsPerSec':
    case 'writesPerSec':
    case 'ioOperationsPerSec': {
      const { suffixedNumber, suffix } = getNumberMetricSuffix(value);
      result = `${formatNumericMeasurement(suffixedNumber)}${suffix} ${unitSuffixes[unitName]}`;
      break;
    }
    case 'percent':
    case 'percentNormalized': {
      const percentNumber = unitName === 'percentNormalized' ? value * 100 : value;
      result = `${formatNumericMeasurement(percentNumber)}%`;
      break;
    }
    case 'boolean':
      result = value === 0 ? 'False' : 'True';
      break;
    case 'custom': {
      let stringifiedValue;
      if (unitOptions?.useMetricSuffix) {
        const { suffixedNumber, suffix } = getNumberMetricSuffix(value);
        stringifiedValue = `${formatNumericMeasurement(suffixedNumber)}${suffix}`;
      } else {
        stringifiedValue = formatNumericMeasurement(value);
      }
      const customUnitName = unitOptions &&
        unitOptions.customName &&
        typeof unitOptions.customName === 'string' ?
        unitOptions.customName : '';
      result = `${stringifiedValue}${customUnitName ? ' ' + customUnitName : ''}`;
      break;
    }
    default:
      result = formatNumericMeasurement(value);
      break;
  }

  return allowHtml ? htmlSafe(result) : result;
}
