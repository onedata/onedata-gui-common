import { expect } from 'chai';
import { describe, it } from 'mocha';
import isUri from 'onedata-gui-common/utils/is-uri';

describe('Unit | Utility | is-uri', function () {
  it('returns true for HTTP URL', function () {
    const result = isUri('http://example.com');
    expect(result).to.be.ok;
  });

  it('returns true for geo coordinates used by Europeana', function () {
    const result = isUri('geo:48.833611111,2.375833333');
    expect(result).to.be.ok;
  });

  it('returns false from "hello" string', function () {
    const result = isUri('hello');
    expect(result).to.be.not.ok;
  });
});
