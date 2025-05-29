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
import _ from 'lodash';

export function boldSubstring(params /*, hash*/ ) {
  if (!params[1]) {
    return params[0];
  }

  const index = params[0].indexOf(params[1]);
  if (index === -1) {
    return params[0];
  }

  const beforeText = _.escape(params[0].slice(0, index));
  const boldText = `<b>${_.escape(params[1])}</b>`;
  const afterText = _.escape(params[0].slice(index + params[1].length));

  return htmlSafe(beforeText + boldText + afterText);
}

export default helper(boldSubstring);
