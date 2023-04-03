/**
 * `string` type value validator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {unknown} value
 * @param {AtmStringDataSpec} atmDataSpec
 * @returns {boolean}
 */
export default function validate(value, atmDataSpec) {
  if (typeof value !== 'string') {
    return false;
  }

  const allowedValues = atmDataSpec?.valueConstraints?.allowedValues;
  if (Array.isArray(allowedValues) && !allowedValues.includes(value)) {
    return false;
  }

  return true;
}
