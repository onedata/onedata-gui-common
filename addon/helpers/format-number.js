/**
 * Formats given number to a human-readable string. By default inserts a space between
 * thousands and rounds float number to the nearest integer. That behavior can be modified
 * using `format` parameter.
 *
 * @module helpers/format-number
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import numberFormatter from 'number-formatter';
import { htmlSafe } from '@ember/string';

export function formatNumber(params, hash) {
  const number = params && params[0] || 0;
  const format = hash && hash.format || '# ##0.';
  const formattedNumber = numberFormatter(format, number || 0);
  // Replace spaces with space-like spans to make copy-paste more user-friendly
  const spacelessFormattedNumber = formattedNumber.replace(
    / /g,
    '<span class="thousand-space"></span>'
  );

  return htmlSafe(spacelessFormattedNumber);
}

export default helper(formatNumber);
