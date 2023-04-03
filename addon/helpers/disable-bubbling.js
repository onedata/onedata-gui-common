/**
 * Disables event bubbling so it does not propagate.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
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
