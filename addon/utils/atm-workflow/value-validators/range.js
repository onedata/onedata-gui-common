/**
 * `range` type value validator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const allowedObjectKeys = Object.freeze(['start', 'end', 'step']);

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

  const { start, end, step } = value;
  const isStepAnInteger = Number.isInteger(step);

  if (
    // check `start` type
    (start !== undefined && !Number.isInteger(start)) ||
    // check `end` type
    !Number.isInteger(end) ||
    // check `step` type
    (step !== undefined && !isStepAnInteger) ||
    // check `step` is not 0
    (isStepAnInteger && step === 0)
  ) {
    return false;
  }

  const normalizedStart = start || 0;
  const normalizedStep = step || 1;

  if (
    // check that `step` is positive for ascending range
    (normalizedStart < end && normalizedStep < 0) ||
    // check that `step` is negative for descending range
    (normalizedStart > end && normalizedStep > 0)
  ) {
    return false;
  }

  return true;
}
