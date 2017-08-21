import { expect } from 'chai';
import { describe, it } from 'mocha';
import stripObject from 'onedata-gui-common/utils/strip-object';

describe('Unit | Utility | strip object', function () {
  // Replace this with your real tests.
  it('creates new object', function () {
    let obj = {};
    let result = stripObject(obj);
    expect(result).to.be.not.null;
    expect(result).to.not.be.equal(obj);
  });

  it('by default removes keys with undefined or null values', function () {
    let obj = {
      one: 1,
      two: 'two2',
      three: undefined,
      four: null,
    };
    let result = stripObject(obj);
    expect(result).to.have.property('one');
    expect(result).to.have.property('two');
    expect(result).to.not.have.property('three');
    expect(result).to.not.have.property('four');
  });

  it('removes keys with values given in parameter', function () {
    let obj = {
      one: 1,
      two: 'two2',
      three: undefined,
      four: null,
      five: '',
      six: 0,
    };
    let result = stripObject(obj, [undefined, null, '']);
    expect(result).to.have.property('one');
    expect(result).to.have.property('two');
    expect(result).to.not.have.property('three');
    expect(result).to.not.have.property('four');
    expect(result).to.not.have.property('five');
    expect(result).to.have.property('six');
  });

  it('removes keys with NaN if NaN is specified to remove', function () {
    let obj = {
      one: NaN,
    };

    let result = stripObject(obj, [NaN]);

    expect(result).to.not.have.property('one');
  });

  it('removes keys multiple keys with null value', function () {
    let obj = {
      one: null,
      two: null,
      three: null,
    };

    let result = stripObject(obj, [null]);

    expect(result).to.not.have.property('one');
    expect(result).to.not.have.property('two');
    expect(result).to.not.have.property('three');
  });

  it('removes keys keys with null value if NaN is also specified', function () {
    let obj = {
      one: null,
    };

    let result = stripObject(obj, [null, NaN]);

    expect(result).to.not.have.property('one');
  });
});
