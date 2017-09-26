/**
 * Util for converting number of bytes to size string. 
 *
 * @module utils/bytes-to-string
 * @author Jakub Liput
 * @copyright (C) 2016-2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const TIB = 1099511627776;
const TERA = 1000000000000;
const GIB = 1073741824;
const GIGA = 1000000000;
const MIB = 1048576;
const MEGA = 1000000;
const KIB = 1024;
const KILO = 1000;

function bytesToStringIEC(bytes) {
  let number = bytes;
  let unit = 'B';
  let multiplicator = 1;
  if (bytes >= TIB) {
    unit = 'TiB';
    number = bytes / TIB;
    multiplicator = TIB;
  } else if (bytes >= GIB) {
    unit = 'GiB';
    number = bytes / GIB;
    multiplicator = GIB;
  } else if (bytes >= MIB) {
    unit = 'MiB';
    number = bytes / MIB;
    multiplicator = MIB;
  } else if (bytes >= KIB) {
    unit = 'KiB';
    number = bytes / KIB;
    multiplicator = KIB;
  }
  return [number, multiplicator, unit];
}

function bytesToStringSI(bytes) {
  let number = bytes;
  let unit = 'B';
  let multiplicator = 1;
  if (bytes >= TERA) {
    unit = 'TB';
    number = bytes / TERA;
    multiplicator = TERA;
  } else if (bytes >= GIGA) {
    unit = 'GB';
    number = bytes / GIGA;
    multiplicator = GIGA;
  } else if (bytes >= MEGA) {
    unit = 'MB';
    number = bytes / MEGA;
    multiplicator = MEGA;
  } else if (bytes >= KILO) {
    unit = 'KB';
    number = bytes / KILO;
    multiplicator = KILO;
  }
  return [number, multiplicator, unit];
}

/**
 * Convert number of bytes to human readable size string. Eg. 2.34 MB.
 * IEC format (KiB, MiB, etc.) can also be used (see options).
 * 
 * @param {Number} bytes
 * @param {Object} [options]
 * @param {Boolean} [options.iecFormat=false] If true, use IEC format: KiB, MiB, GiB
 */
export default function bytesToString(bytes, { iecFormat = false, separated = false } = { iecFormat: false, separated: false }) {
  if (!bytes && bytes !== 0) {
    return '';
  } else {
    let [number, multiplicator, unit] =
    (iecFormat ? bytesToStringIEC : bytesToStringSI)(bytes);
    number = Math.round(number * 10) / 10;
    if (separated) {
      return {
        number,
        multiplicator,
        unit,
      }
    } else {
      return `${number} ${unit}`;
    }
  }
}
