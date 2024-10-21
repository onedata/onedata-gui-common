import { expect } from 'chai';
import { describe, it } from 'mocha';
import EmberObject, { get } from '@ember/object';
import computedSumBy from 'onedata-gui-common/utils/computed-sum-by';

describe('Unit | Utility | computed-sum-by', function () {
  it('computes sum of numerical values mapped from array', function () {
    const testObject = EmberObject.extend({
      test: computedSumBy('fooArray', 'bar'),
    }).create({
      fooArray: Object.freeze([{ bar: 5 }, { bar: 10 }, { bar: 15 }]),
    });
    expect(get(testObject, 'test')).to.equal(30);
  });

  it('returns 0 if the array is empty', function () {
    const testObject = EmberObject.extend({
      test: computedSumBy('fooArray', 'bar'),
    }).create({
      fooArray: Object.freeze([]),
    });
    expect(get(testObject, 'test')).to.equal(0);
  });

  it('returns null if the array contain object with null value', function () {
    const testObject = EmberObject.extend({
      test: computedSumBy('fooArray', 'bar'),
    }).create({
      fooArray: Object.freeze([{ bar: 1 }, { bar: null }]),
    });
    expect(get(testObject, 'test')).to.equal(null);
  });

  it('ignores non-numeric and non-null values', function () {
    const testObject = EmberObject.extend({
      test: computedSumBy('fooArray', 'bar'),
    }).create({
      fooArray: Object.freeze([{ bar: '4' }, { bar: {} }, { bar: 1 }, { foo: 2 }]),
    });
    expect(get(testObject, 'test')).to.equal(1);
  });
});
