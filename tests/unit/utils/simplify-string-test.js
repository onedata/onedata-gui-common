import { expect } from 'chai';
import { describe, it } from 'mocha';
import simplifyString from 'onedata-gui-common/utils/simplify-string';

describe('Unit | Utility | simplify string', function () {
  it('changes spaces to dashes', function () {
    const result = simplifyString('abc def   ghi');
    expect(result).to.be.equal('abc-def-ghi');
  });

  it('removes illegal characters', function () {
    const result = simplifyString('a@#$%^_\bb');
    expect(result).to.be.equal('ab');
  });

  it('converts letters to lowercase', function () {
    const result = simplifyString('aBcD');
    expect(result).to.be.equal('abcd');
  });

  it('removes multiple dashes', function () {
    const result = simplifyString('a-----b');
    expect(result).to.be.equal('a-b');
  });

  it('removes dashes from the start and end of the result', function () {
    const result = simplifyString('-abc-');
    expect(result).to.be.equal('abc');
  });
});
