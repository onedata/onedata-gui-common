import { expect } from 'chai';
import { describe, it } from 'mocha';
import backendifyName from 'onedata-gui-common/utils/backendify-name';

describe('Unit | Utility | backendify name', function () {
  it('trims spaces fron the string', function () {
    expect(backendifyName('  aaa    ')).to.equal('aaa');
  });

  it('removes not allowed chars from start and end', function () {
    expect(backendifyName('.aaa.')).to.equal('aaa');
    expect(backendifyName('.bbb')).to.equal('bbb');
    expect(backendifyName('ccc.')).to.equal('ccc');
  });

  it('removes not allowed chars from the middle of the string', function () {
    expect(backendifyName('abc!def&ghi')).to.equal('abcdefghi');
  });

  it('cuts too long strings', function () {
    const result = backendifyName(
      '123456789_123456789_123456789_123456789_123456789_123456789_123456789'
    );
    expect(result).to.have.lengthOf(50);
  });

  it('pads too short strings', function () {
    expect(backendifyName('a', 'b')).to.equal('ab');
  });

  it('does not pad too short strings if padding is not specified', function () {
    expect(backendifyName('a')).to.equal('a');
  });

  it('leaves empty strings alone', function () {
    expect(backendifyName('')).to.equal('');
  });
});
