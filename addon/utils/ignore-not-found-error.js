/**
 * Util function that can be used to ignore `notFound` errors received
 * in server responses. If error is different than `notFound`, it is
 * rethrown.
 *
 * @module utils/ignore-not-found-error
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 * @param {*} result response
 * @returns {*}
 */
export default function ignoreNotFoundError(result) {
  if (result && result.id !== 'notFound') {
    throw result;
  } else {
    return result;
  }
}
