/**
 * Escapes chart-related contents from unwanted HTML tags.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import DOMPurify from 'dompurify';

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
 * @param {string} content
 * @returns {string}
 */
export default function escapeHtml(content) {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
  });
}
