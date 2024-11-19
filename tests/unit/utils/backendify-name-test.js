import { expect } from 'chai';
import { describe, it } from 'mocha';
import backendifyName, { maxLength } from 'onedata-gui-common/utils/backendify-name';
import _ from 'lodash';

describe('Unit | Utility | backendify-name', function () {
  it('trims spaces from the string', function () {
    expect(backendifyName('  aaa    ')).to.equal('aaa');
  });

  it('removes not allowed single chars from start and end', function () {
    expect(backendifyName('.aaa.')).to.equal('aaa');
    expect(backendifyName('.bbb')).to.equal('bbb');
    expect(backendifyName('ccc.')).to.equal('ccc');
  });

  it('removes not allowed chars from the middle of the string', function () {
    expect(backendifyName('abc!def&ghi')).to.equal('abcdefghi');
  });

  it('cuts too long strings', function () {
    const longString = _.range(0, 50).reduce((str) => str + '123456789_', '');
    const result = backendifyName(
      longString
    );
    expect(result).to.have.lengthOf(maxLength);
  });

  it('does not pad too short strings', function () {
    expect(backendifyName('a')).to.equal('a');
  });

  it('leaves empty strings alone', function () {
    expect(backendifyName('')).to.equal('');
  });

  it('removes multiple not allowed chars from start and end',
    function () {
      expect(backendifyName('....aaa.......')).to.equal('aaa');
      expect(backendifyName(' . .bbb. ...  ')).to.equal('bbb');
    }
  );

  it('removes multiple not allowed chars from start and end that are left after cleaning the middle',
    function () {
      expect(backendifyName('....aaa  !   ')).to.equal('aaa');
      expect(backendifyName('. .% bbb')).to.equal('bbb');
      expect(backendifyName('c #cc. -.')).to.equal('c cc');
    }
  );
});
