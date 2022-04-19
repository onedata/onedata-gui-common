// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * Trims token from whitespaces and all special characters. Only digits and
 * ASCII letters are allowed.
 *
 * @module utils/trim-token
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const tokenRegexp = /[a-zA-Z0-9]+/g;

/**
 * @param {String} token
 * @returns {String} trimmed token
 */
export default function trimToken(token) {
  if (token === null || token === undefined) {
    return token;
  } else {
    token = String(token);
    const correctTokenParts = token.match(tokenRegexp);
    return correctTokenParts ? correctTokenParts.join('') : '';
  }
}
