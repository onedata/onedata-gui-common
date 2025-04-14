import { expect } from 'chai';
import { describe, it } from 'mocha';
import compareNumberArrays from 'onedata-gui-common/utils/compare-number-arrays';

describe('Unit | Utility | compare-number-arrays', function () {
  it('returns -1 for A < B', function () {
    expect(compareNumberArrays(
      [1, 2, 3],
      [3, 5, 7]
    )).to.equal(-1);
  });

  it('return 1 for A > B', function () {
    expect(compareNumberArrays(
      [1, 2, 5],
      [1, 2, 4]
    )).to.equal(1);
  });

  it('returns 0 for A = B', function () {
    expect(compareNumberArrays(
      [1, 2, 3],
      [1, 2, 3]
    )).to.equal(0);
  });

  it('returns -1 for A < B, if having common prefix and B is longer', function () {
    expect(compareNumberArrays(
      [1, 2],
      [1, 2, 3]
    )).to.equal(-1);
  });

  it('returns 1 for a > b, if having common prefix and A is longer', function () {
    expect(compareNumberArrays(
      [1, 2, 3],
      [1, 2]
    )).to.equal(1);
  });

  it('return 0, when both are empty', function () {
    expect(compareNumberArrays(
      [],
      []
    )).to.equal(0);
  });
});
