import { expect } from 'chai';
import { describe, it } from 'mocha';
import asBytes from 'onedata-gui-common/utils/one-histogram/value-formatters/as-bytes';

describe('Unit | Utility | one histogram/value formatters/as bytes', function () {
  // Replace this with your real tests.
  it('works', function () {
    let result = asBytes();
    expect(result).to.be.ok;
  });
});
