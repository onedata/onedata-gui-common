import { expect } from 'chai';
import { describe, it } from 'mocha';
import asBytesPerSecond from 'onedata-gui-common/utils/one-histogram/value-formatters/as-bytes-per-second';

describe('Unit | Utility | one histogram/value formatters/as bytes per second', function () {
  // Replace this with your real tests.
  it('works', function () {
    let result = asBytesPerSecond();
    expect(result).to.be.ok;
  });
});
