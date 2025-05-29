/**
 * This function returns the input text (the first parameter) with the first occurrence of
 * the specified substring (the second parameter) highlighted by making it bold.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function boldSubstring(params /*, hash*/ ) {
  return htmlSafe(params[0].replace(new RegExp(params[1], 'i'), '<b>$&</b>'));
}

export default helper(boldSubstring);
