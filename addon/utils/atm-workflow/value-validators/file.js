/**
 * `file` type value validator.
 *
 * NOTE: This validator does not check whether file type matches value
 * constraints from data spec. Atm file value (in JSON form) only requires
 * existence of correct `file_id` field. File type validation must be done on
 * another level of checking (e.g. in file value editor itself).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
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
    // `datasetId` as these will be automatically removed by backend.
    typeof value.file_id === 'string' &&
    value.file_id.length > 0;
}
