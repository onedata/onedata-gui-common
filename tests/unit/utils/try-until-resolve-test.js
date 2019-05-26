import { expect } from 'chai';
import { describe, it } from 'mocha';
import tryUntilResolve from 'onedata-gui-common/utils/try-until-resolve';
import sinon from 'sinon';

describe('Unit | Utility | try until resolve', function () {
  it('rejects if reject limit is reached', function (done) {
    const repeater = sinon.spy();
    const fun = () => {
      repeater();
      return Promise.reject('error');
    };
    let errorOccurred = false;
    tryUntilResolve(fun, 10, 1)
      .catch(() =>
        errorOccurred = true
      ).then(() => {
        expect(errorOccurred).to.be.true;
        expect(repeater.callCount).to.equal(10);
        done();
      });
  });
});
