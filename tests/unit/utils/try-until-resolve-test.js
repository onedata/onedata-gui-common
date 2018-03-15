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

    const result = tryUntilResolve(fun, 10, 1);

    setTimeout(() => {
      expect(repeater.callCount).to.equal(10);
      result.catch(error => {
        expect(error).to.equal('error');
        done();
      });
    }, 100);
  });
});
