import { expect } from 'chai';
import { describe, it } from 'mocha';
import reduceArrays from 'onedata-gui-common/utils/reduce-arrays';

describe('Unit | Utility | reduce arrays', function () {
  it('can be used to sum multiple arrays elements', function () {
    const result = reduceArrays(
      [1, 2, 3], [10, 20, 30], [100, 200, 300]
    );
    expect(result).to.deep.equal([111, 222, 333]);
  });
});
