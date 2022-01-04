import { default as asBytes } from './as-bytes';

/**
 * @typedef {AsBytesFormatterOptions} AsBytesPerSecondFormatterOptions
 */

/**
 * @param {number} value
 * @param {AsBytesPerSecondFormatterOptions} [formatterOptions]
 */
export default function asBitsPerSecond(value, formatterOptions) {
  if (!Number.isFinite(value)) {
    return '';
  }

  return `${asBytes(value, formatterOptions)}ps`;
}
