import { expect } from 'chai';
import { describe, it } from 'mocha';
import emberComputedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import { default as EmberObject, get } from '@ember/object';

describe('Unit | Utility | ember/computed pipe', function () {
  it('invokes functions on provided property', function () {
    const addOne = function addOne(s) {
      return s + '1';
    };
    const addTwo = function addTwo(s) {
      return s + '2';
    };
    const cls = EmberObject.extend({
      foo: 'bar',
      newFoo: emberComputedPipe(addOne, addTwo, 'foo'),
    });
    const obj = cls.create();

    const result = get(obj, 'newFoo');

    expect(result).to.equal('bar12');
  });
});
