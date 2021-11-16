import { expect } from 'chai';
import { describe, it } from 'mocha';
import sortRevisionNumbers from 'onedata-gui-common/utils/revisions/sort-revision-numbers';

describe('Unit | Utility | revisions/sort revision numbers', function () {
  it('sorts integer revision numbers', function () {
    const result = sortRevisionNumbers([1, 11, 2, 10]);
    expect(result).to.deep.equal([1, 2, 10, 11]);
  });

  it('sorts mixed integer and string revision numbers', function () {
    const result = sortRevisionNumbers([1, '11', '2', 10]);
    expect(result).to.deep.equal([1, 2, 10, 11]);
  });

  it('returns empty array for no revision numbers', function () {
    const result = sortRevisionNumbers([]);
    expect(result).to.deep.equal([]);
  });

  it('returns only valid revision numbers, when some of passed number are invalid',
    function () {
      const result = sortRevisionNumbers(
        [1, 11, 2, 10, null, undefined, -4, 2.5, 'test']
      );
      expect(result).to.deep.equal([1, 2, 10, 11]);
    });
});
