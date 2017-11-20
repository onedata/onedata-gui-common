import { expect } from 'chai';
import { describe, it } from 'mocha';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

describe('Unit | Utility | bytes to string', function () {
  it('can convert byte size to GiB string', function () {
    let result = bytesToString(Math.pow(1024, 3), { iecFormat: true });
    expect(result).to.be.equal('1 GiB');
  });

  it('can convert byte size to MiB string', function () {
    let result = bytesToString(Math.pow(1024, 2), { iecFormat: true });
    expect(result).to.be.equal('1 MiB');
  });

  it('can convert byte size to GB string', function () {
    let result = bytesToString(Math.pow(1000, 3), { iecFormat: false });
    expect(result).to.be.equal('1 GB');
  });

  it('can convert byte size to MB string', function () {
    let result = bytesToString(Math.pow(1000, 2), { iecFormat: false });
    expect(result).to.be.equal('1 MB');
  });

  it('rounds size in string to 1 digit after comma by default (w/o IEC)', function () {
    let result = bytesToString(1251111, { iecFormat: false });
    expect(result).to.be.equal('1.3 MB');
  });
});
