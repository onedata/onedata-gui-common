import { expect } from 'chai';
import { describe, it } from 'mocha';
import compareStringBytes from 'onedata-gui-common/utils/compare-string-bytes';

describe('Unit | Utility | compare-string-bytes', function () {
  it('returns -1 when A < B and both are ASCII', function () {
    expect(compareStringBytes(
      'abc',
      'abd'
    )).to.equal(-1);
  });

  it('returns 1 when A > B and both are ASCII', function () {
    expect(compareStringBytes(
      'abd',
      'abc'
    )).to.equal(1);
  });

  it('returns 0 for the same ASCII strings', function () {
    expect(compareStringBytes(
      'abc',
      'abc'
    )).to.equal(0);
  });

  it('returns -1 when A < B, both are Unicode and differs with last 2-bytes character', function () {
    expect(compareStringBytes(
      'ąbą',
      'ąbć'
    )).to.equal(-1);
  });

  it('returns 1 when A > B, both are Unicode and differs with last 2-bytes character', function () {
    expect(compareStringBytes(
      'ąbć',
      'ąbą'
    )).to.equal(1);
  });
});
