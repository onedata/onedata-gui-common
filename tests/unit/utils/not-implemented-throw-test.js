import { expect } from 'chai';
import { describe, it } from 'mocha';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

describe('Unit | Utility | not-implemented-throw', function () {
  it('throws not implemented exception', function () {
    let caught;
    try {
      notImplementedThrow();
    } catch (error) {
      caught = error;
    } finally {
      expect(caught).to.be.instanceOf(Error);
      expect(caught.toString()).to.match(/not implemented/);
    }
  });
});
