import { expect } from 'chai';
import { describe, it } from 'mocha';
import assertProperty from 'onedata-gui-common/utils/assert-property';

describe('Unit | Utility | assert property', function () {
  it('does not throw assertion error if the property condition is met', function () {
    const obj = {
      hello: 1,
    };

    expect(function () {
      assertProperty(obj, 'hello');
    }).to.not.throw();
  });

  it('throws assertion error if the property condition is not met', function () {
    const obj = {
      hello: 1,
    };

    expect(function () {
      assertProperty(obj, 'world');
    }).to.throw();
  });
});
