import { expect } from 'chai';
import { describe, it } from 'mocha';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import { resolve, reject } from 'rsvp';

describe('Unit | Utility | only fulfilled values', function () {
  it('resolves to an array of fulfilled values', function () {
    const result = onlyFulfilledValues([
      resolve('ok1'),
      reject('err1'),
      resolve('ok2'),
      reject('err2'),
    ]);
    return result.then(fulfilledValues =>
      expect(fulfilledValues).to.be.deep.equal(['ok1', 'ok2'])
    );
  });
});
