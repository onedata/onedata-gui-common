/**
 * Returns true if the text is a link that can be opened in a web browser.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const validProtocolSet = new Set([
  'http',
  'https',
  'ftp',
  'file',
].map(protocol => protocol + ':'));

export default function isUrl(text) {
  let url;
  try {
    url = new URL(text);
  } catch {
    return false;
  }
  return validProtocolSet.has(url.protocol);
}
