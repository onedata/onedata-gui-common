/**
 * Util for converting number of bytes to size string.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2016-2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import getNumberMetricSuffix, {
  suffixesSpec,
} from 'onedata-gui-common/utils/get-number-metric-suffix';

export const siUnits = [{
  name: 'B',
  multiplicator: 1,
}, ...suffixesSpec.decimal.map(({ prefixForUnit, multiplicator }) => ({
  name: `${prefixForUnit}B`,
  multiplicator,
}))];

export const iecUnits = [{
  name: 'B',
  multiplicator: 1,
}, ...suffixesSpec.binary.map(({ prefixForUnit, multiplicator }) => ({
  name: `${prefixForUnit}B`,
  multiplicator,
}))];

function bytesToStringIEC(bytes) {
  const {
    suffixedNumber,
    prefixForUnit,
    suffixMultiplicator,
  } = getNumberMetricSuffix(bytes, { metric: 'binary' });

  return [suffixedNumber, suffixMultiplicator, `${prefixForUnit}B`];
}

function bytesToStringSI(bytes) {
  const {
    suffixedNumber,
    prefixForUnit,
    suffixMultiplicator,
  } = getNumberMetricSuffix(bytes);

  return [suffixedNumber, suffixMultiplicator, `${prefixForUnit}B`];
}

function byteBitUnit(unit) {
  return `${unit.slice(0, -1)}b`;
}

function bytesToStringBitSi(bytes) {
  const [number, multiplicator, unit] = bytesToStringSI(bytes * 8);
  return [number, multiplicator, byteBitUnit(unit)];
}

function bytesToStringBitIec(bytes) {
  const [number, multiplicator, unit] = bytesToStringIEC(bytes * 8);
  return [number, multiplicator, byteBitUnit(unit)];
}

const converters = {
  si: bytesToStringSI,
  iec: bytesToStringIEC,
  bitSi: bytesToStringBitSi,
  bitIec: bytesToStringBitIec,
};

/**
 * Convert number of bytes to human readable size string. Eg. 2.34 MB.
 * IEC format (KiB, MiB, etc.) can also be used (see options).
 *
 * @param {Number} bytes
 * @param {Object} [options]
 * @param {Boolean} [options.iecFormat=true] If true, use IEC format: KiB, MiB, GiB
 *    DEPRECATED, use `options.format` instead. If `options.format` is specified it will be ignored.
 * @param {Boolean} [options.format=si] One of: si, iec, bitSi, bitIec
 * @param {Boolean} [options.separated=false] If true, instead of string,
 * object with fields: number {number}, multiplicator {number}, unit {string}
 * will be returned.
 * @returns {string|object}
 */
export default function bytesToString(bytes, options = {}) {
  const iecFormat = options.iecFormat;
  let separated = options.separated;
  let format = options.format;

  if (iecFormat !== undefined && format === undefined) {
    format = (iecFormat === true ? 'iec' : 'si');
  }
  if (format === undefined) {
    format = 'iec';
  }
  if (separated === undefined) {
    separated = false;
  }

  const bytesAsNumber = Number.parseFloat(bytes);
  if (Number.isNaN(bytesAsNumber)) {
    return '';
  } else {
    let [number, multiplicator, unit] = converters[format](bytesAsNumber);
    number = Math.round(number * 10) / 10;
    if (separated) {
      return {
        number,
        multiplicator,
        unit,
      };
    } else {
      return `${number} ${unit}`;
    }
  }
}
