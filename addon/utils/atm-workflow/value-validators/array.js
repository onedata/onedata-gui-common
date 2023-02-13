/**
 * `array` type value validator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {unknown} value
 * @param {AtmArrayDataSpec} atmDataSpec
 * @param {AtmValueValidatorContext} context
 * @returns {boolean}
 */
export default function validate(value, atmDataSpec, context) {
  if (!Array.isArray(value)) {
    return false;
  }

  if (!context?.validateNestedValue) {
    console.warn(
      'Context passed to the array validator does not contain "validateNestedValue" function.'
    );
    return true;
  }

  const itemDataSpec = atmDataSpec?.valueConstraints?.itemDataSpec;
  if (!itemDataSpec) {
    return false;
  }

  return value.every((item) => context.validateNestedValue(item, itemDataSpec, context));
}
