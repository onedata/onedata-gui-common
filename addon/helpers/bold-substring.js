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
  if (!params[1]) {
    return params[0];
  }

  const escapedQuery = params[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'i');
  const match = regex.exec(params[0]);

  if (!match) {
    return params[0];
  }

  const beforeText = escapeHtml(params[0].slice(0, match.index));
  const boldText = `<b>${escapeHtml(match[0])}</b>`;
  const afterText = escapeHtml(params[0].slice(match.index + match[0].length));

  return htmlSafe(beforeText + boldText + afterText);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default helper(boldSubstring);
