import { expect } from 'chai';
import { describe, it } from 'mocha';
import rejectNotImplemented from 'onedata-gui-common/utils/not-implemented-reject';

describe('Unit | Utility | not-implemented-reject', function () {
  it('rejects with not implemented message', function (done) {
    rejectNotImplemented()
      .then(() => {
        expect(undefined, 'should not resolve').to.be.ok;
      })
      .catch(error => {
        expect(error).to.have.property('message');
        expect(error.message).to.match(/not implemented/);
      })
      .finally(() => {
        done();
      });
  });
});
