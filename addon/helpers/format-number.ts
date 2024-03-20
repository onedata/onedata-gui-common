/**
 * Formats given number to a human-readable string. By default inserts a space between
 * thousands and rounds float number to the nearest integer. That behavior can be modified
 * using `format` parameter.
 *
 * When used as an util function, first parameter can be directly a number. Without
 * nesting it in an array.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import numberFormatter from 'number-formatter';
import { SafeString } from 'onedata-gui-common/utils/missing-types';

type FormatNumberOptions = {
  format?: string,
  allowHtml?: boolean,
};

// Many `#` for fractional part to handle any meaningful fraction length.
const defaultFormat = '# ##0.########';

export function formatNumber(
  number: number,
  options: FormatNumberOptions & { allowHtml: false }
): string;
export function formatNumber(
  number: number,
  options?: FormatNumberOptions
): SafeString;
export function formatNumber(
  number: number,
  options?: FormatNumberOptions
): SafeString | string {
  const normalizedNumber = Number.isNaN(number) ? 0 : number;
  const format = options?.format ?? defaultFormat;

  const formattedNumber = numberFormatter(format, normalizedNumber);

  if (options?.allowHtml === false) {
    return formattedNumber;
  } else {
    // Replace spaces with space-like spans to make copy-paste more user-friendly
    const spacelessFormattedNumber = formattedNumber?.replace(
      / /g,
      '<span class="thousand-space"></span>'
    );
    return htmlSafe(spacelessFormattedNumber);
  }
}

export default helper((params, hash) =>
  formatNumber(Number(params[0]), hash as FormatNumberOptions)
);
