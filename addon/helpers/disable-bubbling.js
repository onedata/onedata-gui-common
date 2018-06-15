/**
 * Disables event bubbling so it does not propagate. 
 * 
 * @module helpers/disable-bubbling
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function disableBubbling([action]) {
  return function (event) {
    event.stopPropagation();
    event.preventDefault();
    return action(event);
  };
}
export default helper(disableBubbling);
