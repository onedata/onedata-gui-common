/**
 * Highlight substring.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function highlightSubstring(params /*, hash*/ ) {
  return htmlSafe(params[0].replace(new RegExp(params[1], 'i'), '<b>$&</b>'));
}

export default helper(highlightSubstring);
