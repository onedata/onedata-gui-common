/**
 * Util function that can be used to ignore `forbidden` errors received
 * in server responses. If error is different than forbidden, it is
 * rethrown.
 *
 * @module utils/igrnore-forbidden-error
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 * 
 * @param {*} result response
 * @returns {*}
 */
export default function ignoreForbiddenError(result) {
  if (result && result.id !== 'forbidden') {
    throw result;
  } else {
    return result;
  }
}
