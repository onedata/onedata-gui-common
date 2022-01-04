/**
 * @typedef {Object} AsStringFormatterOptions
 */

/**
 * @param {number} value
 * @param {AsStringFormatterOptions} [formatterOptions]
 */
export default function asString(value /*, formatterOptions */ ) {
  if (Number.isNaN(value)) {
    return '';
  }

  return String(value);
}
