import { expect } from 'chai';
import { describe, it } from 'mocha';
import { default as merge } from 'onedata-gui-common/utils/ember-object-merge';

import { default as EmberObject, get } from '@ember/object';

describe('Unit | Utility | ember object merge', function () {
  it('merges deeply one ember object into another with plain objects', function () {
    const a = EmberObject.create({
      one: {
        two: 2,
        four: 4,
      },
    });
    const b = EmberObject.create({
      one: {
        two: 20,
        three: 30,
      },
    });
    const c = merge(a, b);
    expect(c, 'returns dest object').to.equal(a);
    expect(get(a, 'one.two'), 'modifies nested property').to.equal(20);
    expect(get(a, 'one.three'), 'adds new nested property').to.equal(30);
    expect(get(a, 'one.four'), 'preserves old nested property').to.equal(4);
  });

  it('merges deeply plain object property that is plain object itself', function () {
    const a = EmberObject.create({
      one: {
        two: {
          three: {
            a: 1,
          }
        },
      },
    });
    const b = EmberObject.create({
      one: {
        two: {
          three: {
            b: 2,
          }
        }
      },
    });
    merge(a, b);
    expect(get(a, 'one.two.three.a'), 'preserves very deep property').to.equal(1);
    expect(get(a, 'one.two.three.b'), 'copies very deep property').to.equal(2);
  });
});
