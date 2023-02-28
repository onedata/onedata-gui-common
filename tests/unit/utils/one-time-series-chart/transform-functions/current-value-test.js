import { expect } from 'chai';
import { describe, it } from 'mocha';
import currentValue from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/current-value';

describe('Unit | Utility | one-time-series-chart/transform-functions/supply-value', function () {
  it('returns value read from context.currentValue', function () {
    const context = { currentValue: 123 };
    expect(currentValue(context)).to.equal(123);
  });

  it('returns null when context.currentValue is not specified', function () {
    const context = {};
    expect(currentValue(context)).to.be.null;
  });
});
