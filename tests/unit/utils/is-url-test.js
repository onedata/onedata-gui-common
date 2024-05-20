import { expect } from 'chai';
import { describe, it } from 'mocha';
import isUrl from 'onedata-gui-common/utils/is-url';

describe('Unit | Utility | is-url', function () {
  it('returns true for http url', function () {
    const result = isUrl('http://example.com');
    expect(result).to.be.true;
  });

  it('returns true for https url', function () {
    const result = isUrl('https://example.com');
    expect(result).to.be.true;
  });

  it('returns false for "javascript" url', function () {
    const result = isUrl('javascript:alert("test")');
    expect(result).to.be.false;
  });

  it('returns false for non-url', function () {
    const result = isUrl('hello');
    expect(result).to.be.false;
  });
});
