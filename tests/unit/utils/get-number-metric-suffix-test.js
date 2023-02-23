import { expect } from 'chai';
import { describe, it } from 'mocha';
import getNumberMetricSuffix from 'onedata-gui-common/utils/get-number-metric-suffix';

export const suffixes = {
  decimal: ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'],
  binary: ['Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'],
};
export const suffixMultipliers = {
  decimal: {},
  binary: {},
};
suffixes.decimal.forEach((suffix, idx) => {
  suffixMultipliers.decimal[suffix] = Math.pow(1000, idx + 1);
});
suffixes.binary.forEach((suffix, idx) => {
  suffixMultipliers.binary[suffix] = Math.pow(2, 10 * (idx + 1));
});
const lowestDecimalSuffix = suffixes.decimal[0];

function prefixForUnit(suffix) {
  return suffix === 'K' ? 'k' : suffix;
}

describe('Unit | Utility | get-number-metric-suffix', function () {
  [
    [undefined, 'no value'],
    [null, 'null'],
    ['123', '"123'],
    [{}, '{}'],
    [NaN, 'NaN'],
    [Number.POSITIVE_INFINITY, 'infinity'],
    [true, 'true'],
  ].forEach(([value, valueString]) => {
    it(`returns empty result for ${valueString}`, function () {
      const result = getNumberMetricSuffix(value);
      expect(result).to.deep.equal({
        originalNumber: 0,
        suffixedNumber: 0,
        suffix: '',
        prefixForUnit: '',
        suffixMultiplicator: 1,
        formattedString: '0',
      });
    });
  });

  ['decimal', 'binary'].forEach((metric) => {
    const lowestSuffix = suffixes[metric][0];
    const highestSuffix = suffixes[metric][suffixes[metric].length - 1];
    const highestNumWithoutSuffix = suffixMultipliers[metric][lowestSuffix] - 1;

    [-0.5, 0, 0.5, 1, 10].forEach((number) => {
      it(`does not find any suffix for ${number} in ${metric} metric`, function () {
        const result = getNumberMetricSuffix(number, { metric });
        expect(result).to.deep.equal({
          originalNumber: number,
          suffixedNumber: number,
          suffix: '',
          prefixForUnit: '',
          suffixMultiplicator: 1,
          formattedString: String(number),
        });
      });
    });

    it(`does not find any suffix for ${highestNumWithoutSuffix} in ${metric} metric`, function () {
      const result = getNumberMetricSuffix(highestNumWithoutSuffix, { metric });
      expect(result).to.deep.equal({
        originalNumber: highestNumWithoutSuffix,
        suffixedNumber: highestNumWithoutSuffix,
        suffix: '',
        prefixForUnit: '',
        suffixMultiplicator: 1,
        formattedString: String(highestNumWithoutSuffix),
      });
    });

    suffixes[metric].forEach((suffix) => {
      const lowestNumWithSuffix = suffixMultipliers[metric][suffix];
      it(`finds suffix "${suffix}" for ${lowestNumWithSuffix} in ${metric} metric`, function () {
        const result = getNumberMetricSuffix(lowestNumWithSuffix, { metric });
        expect(result).to.deep.equal({
          originalNumber: lowestNumWithSuffix,
          suffixedNumber: 1,
          suffix: suffix,
          prefixForUnit: prefixForUnit(suffix),
          suffixMultiplicator: lowestNumWithSuffix,
          formattedString: `1${suffix}`,
        });
      });
    });

    it(`finds suffix for number much larger than the largest suffix multiplier in ${metric} metric`,
      function () {
        const number = suffixMultipliers[metric][highestSuffix] * 1000000;
        const result = getNumberMetricSuffix(number, { metric });
        expect(result).to.deep.equal({
          originalNumber: number,
          suffixedNumber: 1000000,
          suffix: highestSuffix,
          prefixForUnit: prefixForUnit(highestSuffix),
          suffixMultiplicator: suffixMultipliers[metric][highestSuffix],
          formattedString: `1000000${highestSuffix}`,
        });
      });
  });

  it('rounds formatted number to the first fractional digit', function () {
    const number = suffixMultipliers.decimal[lowestDecimalSuffix] * 1.123;
    const result = getNumberMetricSuffix(number);
    expect(result).to.deep.equal({
      originalNumber: number,
      suffixedNumber: number / suffixMultipliers.decimal[lowestDecimalSuffix],
      suffix: lowestDecimalSuffix,
      prefixForUnit: prefixForUnit(lowestDecimalSuffix),
      suffixMultiplicator: suffixMultipliers.decimal[lowestDecimalSuffix],
      formattedString: `1.1${lowestDecimalSuffix}`,
    });
  });

  it('finds suffix for negative numbers', function () {
    const number = -suffixMultipliers.decimal[lowestDecimalSuffix];
    const result = getNumberMetricSuffix(number);
    expect(result).to.deep.equal({
      originalNumber: number,
      suffixedNumber: -1,
      suffix: lowestDecimalSuffix,
      prefixForUnit: prefixForUnit(lowestDecimalSuffix),
      suffixMultiplicator: suffixMultipliers.decimal[lowestDecimalSuffix],
      formattedString: `-1${lowestDecimalSuffix}`,
    });
  });
});
