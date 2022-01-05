import { expect } from 'chai';
import { describe, it } from 'mocha';
import supplyValue from 'onedata-gui-common/utils/one-histogram/transform-functions/supply-value';

describe('Unit | Utility | one histogram/transform functions/supply value', function () {
  it('returns value read from context.valueToSupply', function () {
    const context = { valueToSupply: 123 };
    expect(supplyValue(context)).to.equal(123);
  });

  it('returns null when context.valueToSupply is not specified', function () {
    const context = {};
    expect(supplyValue(context)).to.be.null;
  });
});
