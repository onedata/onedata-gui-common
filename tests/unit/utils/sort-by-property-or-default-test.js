import { expect } from 'chai';
import { describe, it } from 'mocha';
import sortByPropertyOrDefault from 'onedata-gui-common/utils/sort-by-property-or-default';

describe('Unit | Utility | sort-by-property-or-default', function () {
  it('sorts by entityId and then by property', function () {
    const array = [{
        entityId: 1,
        myName: 'def',
      },
      {
        entityId: 2,
        myName: 'abc',
      },
      {
        entityId: 3,
        myName: 'ghi',
      },
    ];
    const result = sortByPropertyOrDefault(array, 3, 'myName');
    expect(result).to.be.deep.equal([{
        entityId: 3,
        myName: 'ghi',
      },
      {
        entityId: 2,
        myName: 'abc',
      },
      {
        entityId: 1,
        myName: 'def',
      },
    ]);
  });
});
