import { expect } from 'chai';
import { describe, it } from 'mocha';
import { bytesToString } from 'onedata-gui-common/helpers/bytes-to-string';

describe('Unit | Helper | bytes-to-string', function () {
  it('supports iecFormat option of bytes-to-string util', function () {
    const result = bytesToString([1024], { iecFormat: true });
    expect(result).to.be.equal('1 KiB');
  });

  it('uses iecFormat=true option of bytes-to-string util by default', function () {
    const result = bytesToString([1024]);
    expect(result).to.be.equal('1 KiB');
  });

  it('generates valid kB string with iecFormat=false as in bytes-to-string util',
    function () {
      const result = bytesToString([1500], { iecFormat: false });
      expect(result).to.be.equal('1.5 kB');
    }
  );

  it('supports format iec option of bytes-to-string util', function () {
    const result = bytesToString([1024], { format: 'iec' });
    expect(result).to.be.equal('1 KiB');
  });
});
