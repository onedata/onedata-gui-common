/**
 * Util for converting number of bytes to size string. 
 *
 * @module utils/bytes-to-string
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2016-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const bytesPrefixes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];

export const siUnits =
  bytesPrefixes.map(
    (prefix, index) => ({
      name: prefix + 'B',
      multiplicator: Math.pow(1000, index),
    })
  );

export const iecUnits =
  bytesPrefixes.map(
    (prefix, index) => ({
      name: prefix === '' ? 'B' : prefix + 'iB',
      multiplicator: Math.pow(1024, index),
    })
  );

function bytesToStringIEC(bytes) {
  let number = bytes;
  let unit = iecUnits[0];
  for (let i = 1; i < iecUnits.length && bytes >= iecUnits[i].multiplicator; i++) {
    unit = iecUnits[i];
    number = bytes / iecUnits[i].multiplicator;
  }
  return [number, unit.multiplicator, unit.name];
}

function bytesToStringSI(bytes) {
  let number = bytes;
  let unit = siUnits[0];
  for (let i = 1; i < siUnits.length && bytes >= siUnits[i].multiplicator; i++) {
    unit = siUnits[i];
    number = bytes / siUnits[i].multiplicator;
  }
  return [number, unit.multiplicator, unit.name];
}

function byteBitUnit(unit) {
  if (unit[0] === 'B') {
    return 'b';
  } else if (unit[0] === 'K') {
    // kilo is an exception when the first letter is small
    return 'kb';
  } else {
    return unit[0] + 'b';
  }
}

function bytesToStringBit(bytes) {
  const [number, multiplicator, unit] = bytesToStringSI(bytes * 8);
  return [number, multiplicator, byteBitUnit(unit)];
}

const converters = {
  si: bytesToStringSI,
  iec: bytesToStringIEC,
  bit: bytesToStringBit,
};

/**
 * Convert number of bytes to human readable size string. Eg. 2.34 MB.
 * IEC format (KiB, MiB, etc.) can also be used (see options).
 * 
 * @param {Number} bytes
 * @param {Object} [options]
 * @param {Boolean} [options.iecFormat=true] If true, use IEC format: KiB, MiB, GiB
 *    DEPRECATED, use `options.format` instead. If `options.format` is specified it will be ignored.
 * @param {Boolean} [options.format=si] One of: si, iec, bit
 * @param {Boolean} [options.separated=false] If true, instead of string, 
 * object with fields: number {number}, multiplicator {number}, unit {string}
 * will be returned.
 * @returns {string|object}
 */
export default function bytesToString(bytes, options = {}) {
  let iecFormat = options.iecFormat;
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

  if (!bytes && bytes !== 0) {
    return '';
  } else {
    let [number, multiplicator, unit] = converters[format](bytes);
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
