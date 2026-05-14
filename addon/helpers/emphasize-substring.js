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

/**
 * @param {[string, string]} params
 * @param {object} options
 * @param {boolean} [options.isCaseSensitive=false]
 * @param {string} [options.htmlTag='b']
 * @returns {SafeString|string}
 */
export function emphasizeSubstring(
  [fullText, substring], { isCaseSensitive, htmlTag } = {}
) {
  const normalizedIsCaseSensitive = isCaseSensitive || false;
  const normalizedHtmlTag = htmlTag || 'b';
  if (!substring) {
    return fullText;
  }

  let substringIndex;
  if (normalizedIsCaseSensitive) {
    substringIndex = fullText.indexOf(substring);
  } else {
    substringIndex = fullText.toLowerCase().indexOf(substring.toLowerCase());
  }

  if (substringIndex === -1) {
    return fullText;
  }

  const beforeText = _.escape(fullText.slice(0, substringIndex));
  const boldText = `<${normalizedHtmlTag}>${_.escape(fullText.slice(
    substringIndex,
    substringIndex + substring.length,
  ))}</${normalizedHtmlTag}>`;
  const afterText = _.escape(fullText.slice(substringIndex + substring.length));

  return htmlSafe(beforeText + boldText + afterText);
}

export default helper(emphasizeSubstring);
