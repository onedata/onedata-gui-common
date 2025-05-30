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

export function boldSubstring([fullText, substring] /*, hash*/ ) {
  if (!substring) {
    return fullText;
  }

  const substringIndex = fullText.indexOf(substring);
  if (substringIndex === -1) {
    return fullText;
  }

  const beforeText = _.escape(fullText.slice(0, substringIndex));
  const boldText = `<b>${_.escape(substring)}</b>`;
  const afterText = _.escape(fullText.slice(substringIndex + substring.length));

  return htmlSafe(beforeText + boldText + afterText);
}

export default helper(boldSubstring);
