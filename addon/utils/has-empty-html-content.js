/**
 * Check if string has empty html content.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';

/**
 * @param { string } body
 * @returns { boolean }
 */
export default function hasEmptyHtmlContent(body) {
  const span = globals.document.createElement('span');
  span.innerHTML = body;
  const text = span.textContent || span.innerText || '';
  return !text.trim();
}
