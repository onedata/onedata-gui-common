/**
 * Util function that can be used to ignore `notFound` errors received
 * in server responses. If error is different than `notFound`, it is
 * rethrown.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ignoreErrorById from 'onedata-gui-common/utils/ignore-error-by-id';

/**
 * @param {*} result response
 * @returns {*}
 */
export default function ignoreNotFoundError(result) {
  return ignoreErrorById(result, 'notFound');
}
