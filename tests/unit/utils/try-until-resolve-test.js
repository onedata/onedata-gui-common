import { expect } from 'chai';
import { describe, it } from 'mocha';
import tryUntilResolve from 'onedata-gui-common/utils/try-until-resolve';
import sinon from 'sinon';
import { Promise } from 'rsvp';

describe('Unit | Utility | try until resolve', function () {
  it('rejects if reject limit is reached', async function () {
    const repeater = sinon.spy();
    const fun = () => {
      repeater();
      return Promise.reject('error');
    };
    let errorOccurred = false;
    await tryUntilResolve(fun, 10, 1).catch(() =>
      errorOccurred = true
    );
    expect(errorOccurred).to.be.true;
    expect(repeater.callCount).to.equal(10);
  });
});
