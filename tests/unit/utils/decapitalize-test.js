import { expect } from 'chai';
import { describe, it } from 'mocha';
import decapitalize from 'onedata-gui-common/utils/decapitalize';
import { htmlSafe } from '@ember/string';

describe('Unit | Utility | decapitalize', function () {
  it('lowers first letter of string', function () {
    const result = decapitalize('Hello world');
    expect(result).to.equal('hello world');
  });

  it('lowers first letter of SafeString', function () {
    const result = decapitalize(htmlSafe('Hello world'));
    expect(result.toString()).to.equal('hello world');
  });
});
