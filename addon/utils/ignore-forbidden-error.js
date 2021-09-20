/**
 * Util function that can be used to ignore `forbidden` errors received
 * in server responses. If error is different than forbidden, it is
 * rethrown.
 *
 * @module utils/ignore-forbidden-error
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 *
 */

import ignoreErrorById from 'onedata-gui-common/utils/ignore-error-by-id';

/**
 * @param {*} result response
 * @returns {*}
 */
export default function ignoreForbiddenError(result) {
  return ignoreErrorById(result, 'forbidden');
}
