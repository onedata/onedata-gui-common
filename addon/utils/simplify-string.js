/**
 * Converts string to format, that satisfies condiditions:
 * * has only lowercase letter, digits and dashes (-),
 * * whitespaces from the original string are converted to dashes,
 * * there are no two and more dashes in a row,
 * * does not start and and with dash.
 * 
 * Example: 
 * ```
 * simplifyString('Abc2-3 @#d-') === 'abc2-3-d'
 * ```
 * 
 * @module utils/simplify-string
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

const WHITESPACES = new RegExp('\\s+', 'g');
const NOT_ALPHANUMERIC_AND_DASH = new RegExp('[^0-9a-z-]', 'g');
const DASH_AT_START_END = new RegExp('(^-+|-+$)', 'g');
const MULTIPLE_DASH = new RegExp('-{2,}', 'g');

export default function simplifyString(str) {
  return str.toLowerCase()
    .replace(WHITESPACES, '-')
    .replace(NOT_ALPHANUMERIC_AND_DASH, '')
    .replace(DASH_AT_START_END, '')
    .replace(MULTIPLE_DASH, '-');
}
