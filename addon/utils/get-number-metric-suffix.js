/**
 * Finds metric suffix for passed number (like 1 000 000 -> 'M'). Can work in two
 * metrics - "decimal" (powers of 10 -> K == 1000) and "binary"
 * (powers of 2 -> Ki == 1024).
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
 *   prefixForUnit: 'k',
 *   suffixMultiplicator: 1000,
 *   formattedString: '2.5K',
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
 * @property {string} suffix Calculated suffix.
 * Might be an empty string if provided number is too small to find any sufficient suffix.
 * @property {string} prefixForUnit Calculated prefix ready to be used for units prefixing
 * (like "M" for B unit to get "MB", etc.). Usually it is the same as `suffix`.
 * @property {number} suffixMultiplicator Multiplicator associated with the suffix.
 * @property {string} formattedString Stringified number with usage of
 * calculated suffix. Suffixed number is rounded to the first fractional digit.
 */

export const suffixesSpec = {
  decimal: [{
    suffix: 'K',
    prefixForUnit: 'k',
  }, {
    suffix: 'M',
  }, {
    suffix: 'G',
  }, {
    suffix: 'T',
  }, {
    suffix: 'P',
  }, {
    suffix: 'E',
  }, {
    suffix: 'Z',
  }, {
    suffix: 'Y',
  }],
  binary: [{
    suffix: 'Ki',
  }, {
    suffix: 'Mi',
  }, {
    suffix: 'Gi',
  }, {
    suffix: 'Ti',
  }, {
    suffix: 'Pi',
  }, {
    suffix: 'Ei',
  }, {
    suffix: 'Zi',
  }, {
    suffix: 'Yi',
  }],
};

suffixesSpec.decimal.forEach((suffixSpec, idx) => {
  suffixSpec.multiplicator = Math.pow(1000, idx + 1);
});
suffixesSpec.binary.forEach((suffixSpec, idx) => {
  suffixSpec.multiplicator = Math.pow(2, 10 * (idx + 1));
});
Object.values(suffixesSpec).forEach((metricSuffixesSpec) =>
  metricSuffixesSpec.forEach((suffixSpec) =>
    suffixSpec.prefixForUnit = suffixSpec.prefixForUnit || suffixSpec.suffix
  )
);

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
      prefixForUnit: '',
      suffixMultiplicator: 1,
      formattedString: '0',
    };
  }

  const normalizedMetric = metric === 'decimal' || metric === 'binary' ?
    metric : 'decimal';

  const numberIsNegative = number < 0;
  const absNumber = Math.abs(number);
  let suffixedNumber = absNumber;
  let suffix = '';
  let suffixMultiplicator = 1;
  let prefixForUnit = '';

  for (const suffixSpecToCheck of suffixesSpec[normalizedMetric]) {
    if (absNumber < suffixSpecToCheck.multiplicator) {
      break;
    }
    suffixedNumber = absNumber / suffixSpecToCheck.multiplicator;
    suffix = suffixSpecToCheck.suffix;
    suffixMultiplicator = suffixSpecToCheck.multiplicator;
    prefixForUnit = suffixSpecToCheck.prefixForUnit;
  }

  if (numberIsNegative) {
    suffixedNumber *= -1;
  }

  const roundedSuffixedNumber = Math.round(suffixedNumber * 10) / 10;
  const formattedString = `${roundedSuffixedNumber}${suffix}`;

  return {
    originalNumber: number,
    suffixedNumber,
    suffix,
    prefixForUnit,
    suffixMultiplicator,
    formattedString,
  };
}
