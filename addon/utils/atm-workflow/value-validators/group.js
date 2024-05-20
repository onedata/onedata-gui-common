/**
 * `group` type value validator.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export default function validate(value) {
  return Boolean(value) &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    // We don't have to check existence of any properties different than
    // `groupId` as these will be automatically removed by backend.
    typeof value.groupId === 'string' &&
    value.groupId.length > 0;
}
