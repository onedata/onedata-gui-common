/**
 * @typedef {Object} AsPercentFormatterOptions
 */

/**
 * @param {number} value
 * @param {AsPercentFormatterOptions} [formatterOptions]
 */
export default function asPercent(value /*, formatterOptions */ ) {
  if (!Number.isFinite(value)) {
    return '';
  }

  return `${Math.floor(value * 100)}%`;
}
