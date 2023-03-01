import { expect } from 'chai';
import { describe, it } from 'mocha';
import emberComputedPipe from 'onedata-gui-common/utils/ember/computed-pipe';
import { default as EmberObject, get } from '@ember/object';

describe('Unit | Utility | ember/computed-pipe', function () {
  it('invokes functions on provided property', function () {
    const addOne = function addOne(s) {
      return s + '1';
    };
    const addTwo = function addTwo(s) {
      return s + '2';
    };
    const cls = EmberObject.extend({
      foo: 'bar',
      newFoo: emberComputedPipe('foo', addOne, addTwo),
    });
    const obj = cls.create();

    const result = get(obj, 'newFoo');

    expect(result).to.equal('bar12');
  });

  it('invokes methods on provided property', function () {
    const cls = EmberObject.extend({
      prefix: 'p',
      foo: 'bar',
      addOne(s) {
        return this.get('prefix') + s + '1';
      },
      addTwo(s) {
        return this.get('prefix') + s + '2';
      },
      newFoo: emberComputedPipe('foo', 'addOne', 'addTwo'),
    });
    const obj = cls.create();

    const result = get(obj, 'newFoo');

    expect(result).to.equal('ppbar12');
  });

  it('handles no functions at all', function () {
    const cls = EmberObject.extend({
      foo: 'bar',
      newFoo: emberComputedPipe('foo'),
    });
    const obj = cls.create();

    const result = get(obj, 'newFoo');

    expect(result).to.equal('bar');
  });
});
