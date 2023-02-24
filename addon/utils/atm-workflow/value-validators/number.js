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
  const integersOnly = Boolean(atmDataSpec?.valueConstraints?.integersOnly);
  return integersOnly ? Number.isInteger(value) : Number.isFinite(value);
}
