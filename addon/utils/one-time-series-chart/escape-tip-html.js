/**
 * Escapes chart-related tips from unwanted HTML tags.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DOMPurify from 'npm:dompurify';

const allowedTags = [
  'b',
  'br',
  'em',
  'i',
  'p',
  'strong',
];
const allowedAttributes = [];

/**
 * @param {string} tip
 * @returns {string}
 */
export default function escapeTipHtml(tip) {
  return DOMPurify.sanitize(tip, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
  });
}
