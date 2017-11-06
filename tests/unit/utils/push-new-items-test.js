import { expect } from 'chai';
import { describe, it } from 'mocha';
import { A } from '@ember/array';
import pushNewItems from 'onedata-gui-common/utils/push-new-items';
import sinon from 'sinon';

import _ from 'lodash';

function createArray(type, content) {
  switch (type) {
    case 'ember':
      return A(content);
    case 'plain':
      return content;
    default:
      throw `Unsupported array type: ${type}`;
  }
}

describe('Unit | Utility | push new items', function () {

  ['plain', 'ember'].forEach(arrayType => {
    it(`adds only new, updated items using compare fun. for ${arrayType} array`,
      function () {
        const a2 = { a: 2 };
        const orig = createArray(arrayType, [
          { a: 1 },
          a2,
          { a: 3, b: 'x' },
          { a: 99 },
        ]);
        const update = createArray(arrayType, [
          { a: 2 },
          { a: 3, b: 'y', c: 'z' },
          { a: 4, b: 'x' },
        ]);

        const result = pushNewItems(orig, update, (x, y) => x.a === y.a);

        expect(result).to.equal(orig);
        expect(result).to.have.lengthOf(5);

        expect(_.find(result, { a: 1 })).to.deep.equal({ a: 1 });
        expect(_.find(result, { a: 2 }), 'do not replace reference')
          .to.equal(a2);
        expect(_.find(result, { a: 3 })).to.deep.equal({ a: 3, b: 'y', c: 'z' });
        expect(_.find(result, { a: 4 })).to.deep.equal({ a: 4, b: 'x' });
        expect(_.find(result, { a: 99 })).to.deep.equal({ a: 99 });
      });
  });

  it('uses pushObject on EmberArrays', function () {
    const orig = A();
    const pushObject = sinon.spy(orig, 'pushObject');

    pushNewItems(orig, ['test'], (x, y) => x === y);

    expect(pushObject).to.be.calledOnce;
  });
});
