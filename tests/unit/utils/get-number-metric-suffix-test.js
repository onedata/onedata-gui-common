import { expect } from 'chai';
import { describe, it } from 'mocha';
import getNumberMetricSuffix from 'onedata-gui-common/utils/get-number-metric-suffix';

const metricSuffixes = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const lowestSuffix = metricSuffixes[0];
const highestSuffix = metricSuffixes[metricSuffixes.length - 1];
const suffixMultipliers = {
  decimal: {},
  binary: {},
};
metricSuffixes.forEach((suffix, idx) => {
  suffixMultipliers.decimal[suffix] = Math.pow(1000, idx + 1);
  suffixMultipliers.binary[suffix] = Math.pow(2, 10 * (idx + 1));
});

describe('Unit | Utility | get number metric suffix', function () {
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
        suffixMultiplicator: 1,
        formattedNumber: '0',
      });
    });
  });

  ['decimal', 'binary'].forEach((metric) => {
    const highestNumWithoutSuffix = suffixMultipliers[metric][lowestSuffix] - 1;

    [-0.5, 0, 0.5, 1, 10].forEach((number) => {
      it(`does not find any suffix for ${number} in ${metric} metric`, function () {
        const result = getNumberMetricSuffix(number, { metric });
        expect(result).to.deep.equal({
          originalNumber: number,
          suffixedNumber: number,
          suffix: '',
          suffixMultiplicator: 1,
          formattedNumber: String(number),
        });
      });
    });

    it(`does not find any suffix for ${highestNumWithoutSuffix} in ${metric} metric`, function () {
      const result = getNumberMetricSuffix(highestNumWithoutSuffix, { metric });
      expect(result).to.deep.equal({
        originalNumber: highestNumWithoutSuffix,
        suffixedNumber: highestNumWithoutSuffix,
        suffix: '',
        suffixMultiplicator: 1,
        formattedNumber: String(highestNumWithoutSuffix),
      });
    });

    metricSuffixes.forEach((suffix) => {
      const lowestNumWithSuffix = suffixMultipliers[metric][suffix];
      it(`finds suffix "${suffix}" for ${lowestNumWithSuffix} in ${metric} metric`, function () {
        const result = getNumberMetricSuffix(lowestNumWithSuffix, { metric });
        expect(result).to.deep.equal({
          originalNumber: lowestNumWithSuffix,
          suffixedNumber: 1,
          suffix: suffix,
          suffixMultiplicator: lowestNumWithSuffix,
          formattedNumber: `1${suffix}`,
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
          suffixMultiplicator: suffixMultipliers[metric][highestSuffix],
          formattedNumber: `1000000${highestSuffix}`,
        });
      });
  });

  it('rounds formatted number to the first fractional digit', function () {
    const number = suffixMultipliers.decimal[lowestSuffix] * 1.123;
    const result = getNumberMetricSuffix(number);
    expect(result).to.deep.equal({
      originalNumber: number,
      suffixedNumber: number / suffixMultipliers.decimal[lowestSuffix],
      suffix: lowestSuffix,
      suffixMultiplicator: suffixMultipliers.decimal[lowestSuffix],
      formattedNumber: `1.1${lowestSuffix}`,
    });
  });

  it('finds suffix for negative numbers', function () {
    const number = -suffixMultipliers.decimal[lowestSuffix];
    const result = getNumberMetricSuffix(number);
    expect(result).to.deep.equal({
      originalNumber: number,
      suffixedNumber: -1,
      suffix: lowestSuffix,
      suffixMultiplicator: suffixMultipliers.decimal[lowestSuffix],
      formattedNumber: `-1${lowestSuffix}`,
    });
  });
});
