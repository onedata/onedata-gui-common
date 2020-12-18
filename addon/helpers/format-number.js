/**
 * Formats given number to a human-readable string. By default inserts a space between
 * thousands and rounds float number to the nearest integer. That behavior can be modified
 * using `format` parameter.
 *
 * When used as an util function, first parameter can be directly a number. Without
 * nesting it in an array.
 *
 * @module helpers/format-number
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import numberFormatter from 'number-formatter';
import { htmlSafe } from '@ember/string';
import { isArray } from '@ember/array';

export function formatNumber(params, hash) {
  const number = Number(isArray(params) ? params[0] : params) || 0;
  const format = hash && hash.format || '# ##0.';
  const formattedNumber = numberFormatter(format, number);
  // Replace spaces with space-like spans to make copy-paste more user-friendly
  const spacelessFormattedNumber = formattedNumber.replace(
    / /g,
    '<span class="thousand-space"></span>'
  );

  return htmlSafe(spacelessFormattedNumber);
}

export default helper(formatNumber);
