/**
 * Converts string to SafeString using `htmlSafe()`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import { htmlSafe as htmlSafeString } from '@ember/string';

export function htmlSafe(params /*, hash*/ ) {
  return htmlSafeString(params[0]);
}

export default helper(htmlSafe);
