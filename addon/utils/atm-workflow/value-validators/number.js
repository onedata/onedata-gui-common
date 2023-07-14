/**
 * `number` type value validator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {unknown} value
 * @param {AtmNumberDataSpec} atmDataSpec
 * @returns {boolean}
 */
export default function validate(value, atmDataSpec) {
  const integersOnly = Boolean(atmDataSpec?.integersOnly);
  if (!(integersOnly ? Number.isInteger(value) : Number.isFinite(value))) {
    return false;
  }

  const allowedValues = atmDataSpec?.allowedValues;
  if (Array.isArray(allowedValues) && !allowedValues.includes(value)) {
    return false;
  }

  return true;
}
