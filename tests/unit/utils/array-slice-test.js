import { expect } from 'chai';
import { describe, it } from 'mocha';
import ArraySlice from 'onedata-gui-common/utils/array-slice';
import _ from 'lodash';
import { settled } from '@ember/test-helpers';
import sinon from 'sinon';
import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';

const ArraySum = EmberObject.extend({
  spy: undefined,
  as: undefined,
  sum: computed('as.[]', function () {
    this.get('spy')();
    return _.sum(this.get('as').toArray());
  }),
});

describe('Unit | Utility | array-slice', function () {
  it('adds an item using pushObject method', function () {
    const sourceArrayTemplate = _.range(0, 10);

    const startIndex = 0;
    const endIndex = 20;
    const indexMargin = 0;

    const as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    as.pushObject('x');

    expect(as.toArray()).to.deep.equal([...sourceArrayTemplate, 'x']);
  });

  it('adds multiple items using pushObjects method', function () {
    const sourceArrayTemplate = _.range(0, 10);

    const startIndex = 0;
    const endIndex = 20;
    const indexMargin = 0;

    const as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    as.pushObjects(['x', 'y', 'z']);

    expect(as.toArray()).to.deep.equal([...sourceArrayTemplate, 'x', 'y', 'z']);
  });

  it('returns a slice of current range using slice method', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 5;
    const endIndex = 15;
    const indexMargin = 0;

    const as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(as.slice(5, 10)).to.deep.equal(_.range(10, 15));
  });

  it('returns a slice to the end of current range using slice method with only begin argument', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 0;
    const endIndex = 10;
    const indexMargin = 0;

    const as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(as.slice(5)).to.deep.equal(_.range(5, endIndex));
  });

  it('returns a copy of sliced array using slice method without arguments', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 5;
    const endIndex = 15;
    const indexMargin = 0;

    const as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(as.slice()).to.deep.equal(_.range(5, 15));
  });

  it('returns a slice of current range using slice method with negative arguments', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 5;
    const endIndex = 15;
    const indexMargin = 0;

    const as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(as.slice(-3, -1)).to.deep.equal(_.range(12, 14));
  });

  [
    'insertAt',
    'removeAt',
    'setObjects',
    'unshiftObject',
    'unshiftObjects',
  ].forEach(methodName => {
    it(`throws not implemented error for "${methodName}" method`, function () {
      const startIndex = 0;
      const endIndex = 20;
      const indexMargin = 0;

      const as = ArraySlice.create({
        sourceArray: A([]),
        startIndex,
        endIndex,
        indexMargin,
      });

      try {
        as[methodName]();
        throw new Error('method should throw');
      } catch (error) {
        expect(error.toString()).to.contain('not implemented in array-slice');
      }
    });
  });

  it('exposes array containing slice of original array', function () {
    const sourceArray = A(_.range(0, 100));

    const startIndex = 50;
    const endIndex = 70;
    const indexMargin = 10;

    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(
      as.toArray(),
      'should be slice of source array from 40 to 80'
    ).to.deep.equal(_.range(40, 80));
  });

  it('changes array contents when requested indices change', async function () {
    const sourceArray = A(_.range(0, 100));
    const startIndex = 50;
    const endIndex = 70;
    const indexMargin = 10;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    as.setProperties({
      startIndex: 30,
      endIndex: 35,
    });

    const native = as.toArray();
    await settled();
    expect(
      native,
      `${JSON.stringify(native)} should be array from 20 to 45`
    ).to.deep.equal(_.range(20, 45));
  });

  it('allows to iterate on it with forEach', function () {
    const sourceArray = A(_.range(0, 100));
    const startIndex = 50;
    const endIndex = 70;
    const indexMargin = 10;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    let j = 0;
    as.forEach(() => j++);
    expect(j).to.equal(40);
  });

  it('delegates pushObject to sourceArray', async function () {
    const sourceArray = A(_.range(0, 100));
    const startIndex = 50;
    const endIndex = 70;
    const indexMargin = 10;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    as.pushObject('x');

    expect(
      as.toArray(),
      'should be still a slice of source array from 40 to 80'
    ).to.deep.equal(_.range(40, 80));

    as.setProperties({
      indexMargin: 1,
      startIndex: 100,
      endIndex: 101,
    });

    await settled();
    const native = as.toArray();

    expect(
      native,
      `${JSON.stringify(native)} should contain pushed object`
    ).to.deep.equal([99, 'x']);
  });

  it('does not notify about changes in sourceArray if index is out of range',
    async function () {
      const sourceArray = A(_.range(0, 100));
      const startIndex = 0;
      const endIndex = 5;
      const indexMargin = 1;
      const as = ArraySlice.create({
        sourceArray,
        startIndex,
        endIndex,
        indexMargin,
      });

      const spy = sinon.spy();

      const obj = EmberObject.extend({
        as,
        sum: computed('as.[]', function () {
          spy();
          return _.sum(this.get('as').toArray());
        }),
      }).create();

      expect(obj.get('sum')).to.equal(15);

      as.pushObject(10000);

      await settled();
      expect(obj.get('sum')).to.equal(15);
      expect(spy).to.be.calledOnce;
    });

  it('notifies about changes in sourceArray if index is in range', async function () {
    const sourceArray = A(_.concat([99, 99, 99], _.range(0, 6)));
    const startIndex = 3;
    const endIndex = 10;
    const indexMargin = 0;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = EmberObject.extend({
      as,
      sum: computed('as.[]', function () {
        spy();
        return _.sum(this.get('as').toArray());
      }),
    }).create();

    expect(obj.get('sum')).to.equal(15);

    as.pushObject(10000);

    await settled();
    expect(obj.get('sum')).to.equal(10015);
    expect(spy).to.be.calledTwice;
  });

  it('notifies about changes in array if increasing the endIndex', async function () {
    const sourceArray = A(_.concat(_.range(0, 10)));
    const startIndex = 0;
    const endIndex = 3;
    const indexMargin = 0;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum([0, 1, 2]));

    as.set('endIndex', 5);

    await settled();
    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(0, 5)));
  });

  it('notifies about changes in array if decreasing the endIndex', async function () {
    const sourceArray = A(_.concat(_.range(0, 10)));
    const startIndex = 0;
    const endIndex = 5;
    const indexMargin = 0;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum(_.range(0, 5)));

    as.set('endIndex', 3);

    await settled();
    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(0, 3)));
  });

  it('notifies about changes in array if decreasing the startIndex', async function () {
    const sourceArray = A(_.concat(_.range(0, 10)));
    const startIndex = 7;
    const endIndex = 9;
    const indexMargin = 0;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum(_.range(7, 9)));

    as.set('startIndex', 5);

    await settled();
    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(5, 9)));
  });

  it('notifies about changes in array if increasing the startIndex', async function () {
    const sourceArray = A(_.concat(_.range(0, 10)));
    const startIndex = 7;
    const endIndex = 10;
    const indexMargin = 0;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum(_.range(7, 10)));

    as.set('startIndex', 8);

    await settled();
    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(8, 10)));
  });

  it('notifies about changes in array if changing the indexMargin', async function () {
    const sourceArray = A(_.concat(_.range(0, 100)));
    const startIndex = 20;
    const endIndex = 25;
    const indexMargin = 10;
    const as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as,
      spy,
    });

    expect(obj.get('sum'), '10..35').to.equal(_.sum(_.range(10, 35)));

    as.set('indexMargin', 5);

    await settled();
    const newSum = obj.get('sum');
    await settled();
    expect(spy).to.be.calledTwice;
    expect(newSum, '15..30').to.equal(_.sum(_.range(15, 30)));
  });

  it('immediately returns new firstObject if changing startIndex and endIndex',
    function () {
      const sourceArray = A(_.concat(_.range(0, 20).map(i => ({ i }))));
      const as = ArraySlice.create({
        sourceArray,
        startIndex: 7,
        endIndex: 10,
        indexMargin: 0,
      });

      expect(as.get('firstObject')).to.deep.equal({ i: 7 });
      expect(as.get('lastObject')).to.deep.equal({ i: 9 });

      as.setProperties({ startIndex: 8, endIndex: 11 });

      expect(as.get('firstObject')).to.deep.equal({ i: 8 });
      expect(as.get('lastObject')).to.deep.equal({ i: 10 });
    });
});
