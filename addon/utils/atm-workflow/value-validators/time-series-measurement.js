/**
 * `timeSeriesMeasurement` type value validator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const allowedObjectKeys = Object.freeze(['timestamp', 'tsName', 'value']);

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export default function validate(value) {
  if (
    // check value is not empty
    !value ||
    // check value is an object
    typeof value !== 'object' ||
    // check value does not contain any unknown keys
    Object.keys(value).filter((k) => !allowedObjectKeys.includes(k)).length > 0
  ) {
    return false;
  }

  const { timestamp, tsName, value: measurementValue } = value;

  return Number.isInteger(timestamp) &&
    timestamp > 0 &&
    typeof tsName === 'string' &&
    tsName.length > 0 &&
    Number.isFinite(measurementValue);
}
