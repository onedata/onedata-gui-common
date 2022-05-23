/**
 * Finds metric suffix for passed number (like 1 000 000 -> 'M'). Can work in two
 * metrics - "decimal" (powers of 10 -> K == 1000) and "binary"
 * (powers of 2 -> K == 1024).
 *
 * Returns object with complex information about the metric suffix representation. See
 * at `GetNumberMetricSuffixResult` typedef for more information.
 *
 * Example:
 * ```
 * getNumberMetricSuffix(2500);
 * ```
 * will return:
 * ```
 * {
 *   originalNumber: 2500,
 *   suffixedNumber: 2.5,
 *   suffix: 'K',
 *   suffixMultiplicator: 1000,
 *   formattedNumber: '1K',
 * }
 * ```
 *
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} GetNumberMetricSuffixOptions
 * @property {'decimal'|'binary'} [metric]
 */

/**
 * @typedef {Object} GetNumberMetricSuffixResult
 * @property {number} originalNumber Number passed to function. 0 if provided
 * value was not a number.
 * @property {number} suffixedNumber Rescaled number according to found suffix.
 * @property {MetricSuffix} suffix Calculated suffix. Might be an empty
 * string if provided number is too small to find any sufficient suffix.
 * @property {number} suffixMultiplicator Multiplicator associated with the suffix.
 * @property {string} formattedNumber Stringified number with usage of
 * calculated suffix. Suffixed number is rounded to the first fractional digit.
 */

/**
 * @typedef {''|'K'|'M'|'G'|'T'|'P'|'E'|'Z'|'Y'} MetricSuffix
 */

export const suffixes = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
export const suffixMultipliers = {
  decimal: {},
  binary: {},
};
suffixes.forEach((suffix, idx) => {
  suffixMultipliers.decimal[suffix] = Math.pow(1000, idx + 1);
  suffixMultipliers.binary[suffix] = Math.pow(2, 10 * (idx + 1));
});

/**
 * @param {number} number
 * @param {GetNumberMetricSuffixOptions} options
 * @returns {GetNumberMetricSuffixResult}
 */
export default function getNumberMetricSuffix(number, { metric = 'decimal' } = {}) {
  if (!Number.isFinite(number)) {
    return {
      originalNumber: 0,
      suffixedNumber: 0,
      suffix: '',
      suffixMultiplicator: 1,
      formattedNumber: '0',
    };
  }

  const normalizedMetric = metric === 'decimal' || metric === 'binary' ?
    metric : 'decimal';

  const numberIsNegative = number < 0;
  const absNumber = Math.abs(number);
  let suffixedNumber = absNumber;
  let suffix = '';
  let suffixMultiplicator = 1;

  for (const suffixToCheck of suffixes) {
    const multiplierToCheck = suffixMultipliers[normalizedMetric][suffixToCheck];
    if (absNumber < multiplierToCheck) {
      break;
    }
    suffixedNumber = absNumber / multiplierToCheck;
    suffix = suffixToCheck;
    suffixMultiplicator = multiplierToCheck;
  }

  if (numberIsNegative) {
    suffixedNumber *= -1;
  }

  const roundedSuffixedNumber = Math.round(suffixedNumber * 10) / 10;
  const formattedNumber = `${roundedSuffixedNumber}${suffix}`;

  return {
    originalNumber: number,
    suffixedNumber,
    suffix,
    suffixMultiplicator,
    formattedNumber,
  };
}
