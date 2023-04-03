/**
 * Converts value to boolean value.
 *
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

export function bool([value]) {
  return Boolean(value);
}

export default helper(bool);
