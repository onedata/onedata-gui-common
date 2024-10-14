import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject, { get } from '@ember/object';
import computedIsEvery from 'onedata-gui-common/utils/computed-is-every';

describe('Unit | Utility | computed-is-every', function () {
  it('returns true if every value at the key is truthy when checkedValue is not provided', function () {
    const testObject = EmberObject.extend({
      test: computedIsEvery('fooArray', 'bar'),
    }).create({
      fooArray: Object.freeze([{ bar: true }, { bar: 10 }, { bar: 'a' }]),
    });
    expect(get(testObject, 'test')).to.equal(true);
  });

  it('returns false if not every value at the key is truthy when checkedValue is not provided', function () {
    const testObject = EmberObject.extend({
      test: computedIsEvery('fooArray', 'bar'),
    }).create({
      fooArray: Object.freeze([{ bar: true }, { bar: 0 }, { bar: 'a' }]),
    });
    expect(get(testObject, 'test')).to.equal(false);
  });

  it('returns true if every value at the key equals the provided checkedValue', function () {
    const testObject = EmberObject.extend({
      test: computedIsEvery('fooArray', 'bar', 0),
    }).create({
      fooArray: Object.freeze([{ bar: 0 }, { bar: 0 }, { bar: 0 }]),
    });
    expect(get(testObject, 'test')).to.equal(true);
  });

  it('returns true if every value at the key equals the provided checkedValue', function () {
    const testObject = EmberObject.extend({
      test: computedIsEvery('fooArray', 'bar', 1),
    }).create({
      fooArray: Object.freeze([{ bar: 0 }, { bar: 1 }, { bar: 0 }]),
    });
    expect(get(testObject, 'test')).to.equal(false);
  });
});
