import { expect } from 'chai';
import { describe, it } from 'mocha';
import emberSortByProperties from 'onedata-gui-common/utils/ember/sort-by-properties';

describe('Unit | Utility | ember/sort-by-properties', function () {
  it('can use two properties and respects asc/desc', function () {
    const items = [
      { a: 3, b: 1 },
      { a: 4, b: 1 },
      { a: 2, b: 1 },
      { a: 1, b: 1 },
      { a: 1, b: 2 },
      { a: 2, b: 3 },
      { a: 3, b: 4 },
      { a: 4, b: 5 },
    ];
    const result = emberSortByProperties(items, ['b:desc', 'a:asc']);
    expect(result).to.be.deep.equal([
      { a: 4, b: 5 },
      { a: 3, b: 4 },
      { a: 2, b: 3 },
      { a: 1, b: 2 },
      { a: 1, b: 1 },
      { a: 2, b: 1 },
      { a: 3, b: 1 },
      { a: 4, b: 1 },
    ]);
  });
});
