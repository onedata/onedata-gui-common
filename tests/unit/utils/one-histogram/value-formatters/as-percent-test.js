import { expect } from 'chai';
import { describe, it } from 'mocha';
import asPercent from 'onedata-gui-common/utils/one-histogram/value-formatters/as-percent';

describe('Unit | Utility | one histogram/value formatters/as percent', function () {
  // Replace this with your real tests.
  it('works', function () {
    let result = asPercent();
    expect(result).to.be.ok;
  });
});
