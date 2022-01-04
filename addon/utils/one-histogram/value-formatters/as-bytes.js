import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

/**
 * @typedef {Object} AsBytesFormatterOptions
 * @property {AsBytesFormatterFormat} format
 */

/**
 * @typedef {'si'|'iec'|'bit'} AsBytesFormatterFormat
 */

export const possibleFormats = ['iec', 'si', 'bit'];

/**
 * @param {number} value
 * @param {AsBytesFormatterOptions} [formatterOptions]
 */
export default function asBytes(value, formatterOptions) {
  if (!Number.isFinite(value)) {
    return '';
  }
  const format = formatterOptions && formatterOptions.format;
  const normalizedFormat = possibleFormats.includes(format) ?
    format : possibleFormats[0];

  return bytesToString(value, { format: normalizedFormat });
}
