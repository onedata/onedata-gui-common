import { expect } from 'chai';
import { describe, it } from 'mocha';
import createPropertyComparator from 'onedata-gui-common/utils/create-property-comparator';

describe('Unit | Utility | create property comparator', function () {
  it('creates function that sorts objects by string property', function () {
    const objects = [{
        id: 1,
        hello: '3',
        world: '2',
      },
      {
        id: 2,
        hello: '1',
        world: '3',
      },
      {
        id: 3,
        hello: '2',
        world: '1',
      }
    ];
    const helloComparator = createPropertyComparator('hello');
    const worldComparator = createPropertyComparator('world');
    expect(objects.sort(helloComparator).mapBy('id')).to.be.deep.equal(
      [2, 3, 1]
    );
    expect(objects.sort(worldComparator).mapBy('id')).to.be.deep.equal(
      [3, 1, 2]
    );
  });
});
