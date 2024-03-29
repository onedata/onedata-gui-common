/**
 * Inserts dots that represents "some unknown password"
 *
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';

import { htmlSafe } from '@ember/string';

const PASSWORD_DOT = '●';

export function fakePassword([dotsCount = 5] /*, hash*/ ) {
  return htmlSafe(PASSWORD_DOT.repeat(dotsCount));
}

export default helper(fakePassword);
