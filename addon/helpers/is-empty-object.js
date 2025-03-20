/**
 * Returns true for:
 * - undefined,
 * - null,
 * - object that have no properties (`{}`).
 *
 * For everything else, returns false.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export default helper(function isEmptyObject(params /*, hash*/ ) {
  const object = params[0];
  if (object === undefined || object === null) {
    return true;
  }
  if (typeof object !== 'object') {
    return false;
  }
  return Object.keys(object).length === 0;
});
