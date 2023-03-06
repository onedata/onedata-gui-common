/**
 * Util function that can be used to ignore specific errors received
 * in server responses. Errors to ignore are matched by `id`
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @param {*} result response
 * @param {String} errorIdToIgnore
 * @returns {*}
 */
export default function ignoreErrorById(result, errorIdToIgnore) {
  if (result && result.id !== errorIdToIgnore) {
    throw result;
  } else {
    return result;
  }
}
