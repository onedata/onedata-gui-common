import { expect } from 'chai';
import { describe, it } from 'mocha';
import getNextFreeRevisionNumber from 'onedata-gui-common/utils/revisions/get-next-free-revision-number';

describe('Unit | Utility | revisions/get next free revision number', function () {
  it('returns 1 for empty array of revision numbers', function () {
    expect(getNextFreeRevisionNumber([])).to.equal(1);
  });

  it('returns 15 for revision numbers [1, 2, 12, 14]', function () {
    expect(getNextFreeRevisionNumber([1, 2, 12, 14])).to.equal(15);
  });

  it('returns 15 for revision numbers [14, 12, 2, 1]', function () {
    expect(getNextFreeRevisionNumber([14, 12, 2, 1]))
      .to.equal(getNextFreeRevisionNumber([1, 2, 12, 14]));
  });

  it('returns 15 for revision numbers ["1", "2", "14"]', function () {
    expect(getNextFreeRevisionNumber(['1', '2', '14']))
      .to.equal(getNextFreeRevisionNumber([1, 2, 12, 14]));
  });

  // Cases below should not take place in the real world, but still it is worth testing

  it('returns 15 for revision numbers [14, 14, 14]', function () {
    expect(getNextFreeRevisionNumber([14, 14, 14])).to.equal(15);
  });

  it('returns 1 for revision numbers [NaN, -3, "someWeirdValue"]', function () {
    expect(getNextFreeRevisionNumber([NaN, -3, 'someWeirdValue'])).to.equal(1);
  });
});
