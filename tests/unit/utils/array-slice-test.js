import { expect } from 'chai';
import { describe, it, afterEach } from 'mocha';
import ArraySlice from 'onedata-gui-common/utils/array-slice';
import _ from 'lodash';
import sinon from 'sinon';
import { A } from '@ember/array';
import EmberObject, { computed } from '@ember/object';

const ArraySum = EmberObject.extend({
  spy: undefined,
  as: undefined,
  sum: computed('as.[]', function sum() {
    this.get('spy')();
    return _.sum(this.get('as').toArray());
  }),
});

describe('Unit | Utility | array-slice', function () {
  afterEach(function () {
    this.as?.destroy();
  });

  it('adds an item using pushObject method', function () {
    const sourceArrayTemplate = _.range(0, 10);

    const startIndex = 0;
    const endIndex = 20;
    const indexMargin = 0;

    this.as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    this.as.pushObject('x');

    expect(this.as.toArray()).to.deep.equal([...sourceArrayTemplate, 'x']);
  });

  it('adds multiple items using pushObjects method', function () {
    const sourceArrayTemplate = _.range(0, 10);

    const startIndex = 0;
    const endIndex = 20;
    const indexMargin = 0;

    this.as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    this.as.pushObjects(['x', 'y', 'z']);

    expect(this.as.toArray()).to.deep.equal([...sourceArrayTemplate, 'x', 'y', 'z']);
  });

  it('returns a slice of current range using slice method', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 5;
    const endIndex = 15;
    const indexMargin = 0;

    this.as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(this.as.slice(5, 10)).to.deep.equal(_.range(10, 15));
  });

  it('returns a slice to the end of current range using slice method with only begin argument', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 0;
    const endIndex = 10;
    const indexMargin = 0;

    this.as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(this.as.slice(5)).to.deep.equal(_.range(5, endIndex));
  });

  it('returns a copy of sliced array using slice method without arguments', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 5;
    const endIndex = 15;
    const indexMargin = 0;

    this.as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(this.as.slice()).to.deep.equal(_.range(5, 15));
  });

  it('returns a slice of current range using slice method with negative arguments', function () {
    const sourceArrayTemplate = _.range(0, 20);

    const startIndex = 5;
    const endIndex = 15;
    const indexMargin = 0;

    this.as = ArraySlice.create({
      sourceArray: A([...sourceArrayTemplate]),
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(this.as.slice(-3, -1)).to.deep.equal(_.range(12, 14));
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

      this.as = ArraySlice.create({
        sourceArray: A([]),
        startIndex,
        endIndex,
        indexMargin,
      });

      try {
        this.as[methodName]();
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

    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    expect(
      this.as.toArray(),
      'should be slice of source array from 40 to 80'
    ).to.deep.equal(_.range(40, 80));
  });

  it('changes array contents when requested indices change', function () {
    const sourceArray = A(_.range(0, 100));
    const startIndex = 50;
    const endIndex = 70;
    const indexMargin = 10;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    this.as.setProperties({
      startIndex: 30,
      endIndex: 35,
    });

    const native = this.as.toArray();
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
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    let j = 0;
    this.as.forEach(() => j++);
    expect(j).to.equal(40);
  });

  it('delegates pushObject to sourceArray', function () {
    const sourceArray = A(_.range(0, 100));
    const startIndex = 50;
    const endIndex = 70;
    const indexMargin = 10;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    this.as.pushObject('x');

    expect(
      this.as.toArray(),
      'should be still a slice of source array from 40 to 80'
    ).to.deep.equal(_.range(40, 80));

    this.as.setProperties({
      indexMargin: 1,
      startIndex: 100,
      endIndex: 101,
    });

    const native = this.as.toArray();

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
      this.as = ArraySlice.create({
        sourceArray,
        startIndex,
        endIndex,
        indexMargin,
      });

      const spy = sinon.spy();

      const obj = EmberObject.extend({
        as: this.as,
        sum: computed('as.[]', function sum() {
          spy();
          return _.sum(this.as.toArray());
        }),
      }).create();

      expect(obj.get('sum')).to.equal(15);

      this.as.pushObject(10000);

      expect(obj.get('sum')).to.equal(15);
      expect(spy).to.be.calledOnce;
    }
  );

  it('notifies about changes in sourceArray if index is in range', function () {
    const sourceArray = A(_.concat([99, 99, 99], _.range(0, 6)));
    const startIndex = 3;
    const endIndex = 10;
    const indexMargin = 0;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = EmberObject.extend({
      as: this.as,
      sum: computed('as.[]', function () {
        spy();
        return _.sum(this.get('as').toArray());
      }),
    }).create();

    expect(obj.get('sum')).to.equal(15);

    this.as.pushObject(10000);

    expect(obj.get('sum')).to.equal(10015);
    expect(spy).to.be.calledTwice;
  });

  it('notifies about changes in array if increasing the endIndex', function () {
    const sourceArray = A(_.range(0, 10));
    const startIndex = 0;
    const endIndex = 3;
    const indexMargin = 0;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as: this.as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum([0, 1, 2]));

    this.as.set('endIndex', 5);

    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(0, 5)));
  });

  it('notifies about changes in array if decreasing the endIndex', function () {
    const sourceArray = A(_.range(0, 10));
    const startIndex = 0;
    const endIndex = 5;
    const indexMargin = 0;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as: this.as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum(_.range(0, 5)));

    this.as.set('endIndex', 3);

    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(0, 3)));
  });

  it('notifies about changes in array if decreasing the startIndex', function () {
    const sourceArray = A(_.range(0, 10));
    const startIndex = 7;
    const endIndex = 9;
    const indexMargin = 0;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as: this.as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum(_.range(7, 9)));

    this.as.set('startIndex', 5);

    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(5, 9)));
  });

  it('notifies about changes in array if increasing the startIndex', function () {
    const sourceArray = A(_.range(0, 10));
    const startIndex = 7;
    const endIndex = 10;
    const indexMargin = 0;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as: this.as,
      spy,
    });

    expect(obj.get('sum')).to.equal(_.sum(_.range(7, 10)));

    this.as.set('startIndex', 8);

    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum).to.equal(_.sum(_.range(8, 10)));
  });

  it('notifies about changes in array if changing the indexMargin', function () {
    const sourceArray = A(_.range(0, 100));
    const startIndex = 20;
    const endIndex = 25;
    const indexMargin = 10;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });

    const spy = sinon.spy();

    const obj = ArraySum.create({
      as: this.as,
      spy,
    });

    expect(obj.get('sum'), '10..35').to.equal(_.sum(_.range(10, 35)));

    this.as.set('indexMargin', 5);

    const newSum = obj.get('sum');
    expect(spy).to.be.calledTwice;
    expect(newSum, '15..30').to.equal(_.sum(_.range(15, 30)));
  });

  it('immediately returns new firstObject if changing startIndex and endIndex',
    function () {
      const sourceArray = A(_.concat(_.range(0, 20).map(i => ({ i }))));
      this.as = ArraySlice.create({
        sourceArray,
        startIndex: 7,
        endIndex: 10,
        indexMargin: 0,
      });

      expect(this.as.get('firstObject')).to.deep.equal({ i: 7 });
      expect(this.as.get('lastObject')).to.deep.equal({ i: 9 });

      this.as.setProperties({ startIndex: 8, endIndex: 11 });

      expect(this.as.get('firstObject')).to.deep.equal({ i: 8 });
      expect(this.as.get('lastObject')).to.deep.equal({ i: 10 });
    }
  );

  it('does not notify sourceArray [] change if only start/end is changed', function () {
    // given
    const sourceArray = A(_.range(0, 100));
    const startIndex = 0;
    const endIndex = 10;
    const indexMargin = 0;
    this.as = ArraySlice.create({
      sourceArray,
      startIndex,
      endIndex,
      indexMargin,
    });
    const spy = sinon.spy();
    const obj = EmberObject.extend({
      testProperty: computed('as.sourceArray.[]', function testProperty() {
        this.spy();
        return null;
      }),
    }).create({
      as: this.as,
      spy,
    });

    // when
    obj.testProperty;
    this.as.setProperties({
      startIndex: 5,
      endIndex: 15,
    });
    obj.testProperty;

    // then
    expect(spy).to.be.calledOnce;
  });
});
