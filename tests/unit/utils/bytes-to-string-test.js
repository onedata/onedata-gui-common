import { expect } from 'chai';
import { describe, it } from 'mocha';
import bytesToString from 'onedata-gui-common/utils/bytes-to-string';

describe('Unit | Utility | bytes to string', function () {
  it('can convert byte size to YiB string', function () {
    const result = bytesToString(Math.pow(1024, 8), { iecFormat: true });
    expect(result).to.be.equal('1 YiB');
  });

  it('can convert byte size to ZiB string', function () {
    const result = bytesToString(Math.pow(1024, 7), { iecFormat: true });
    expect(result).to.be.equal('1 ZiB');
  });

  it('can convert byte size to EiB string', function () {
    const result = bytesToString(Math.pow(1024, 6), { iecFormat: true });
    expect(result).to.be.equal('1 EiB');
  });

  it('can convert byte size to PiB string', function () {
    const result = bytesToString(Math.pow(1024, 5), { iecFormat: true });
    expect(result).to.be.equal('1 PiB');
  });

  it('can convert byte size to TiB string', function () {
    const result = bytesToString(Math.pow(1024, 4), { iecFormat: true });
    expect(result).to.be.equal('1 TiB');
  });

  it('can convert byte size to GiB string', function () {
    const result = bytesToString(Math.pow(1024, 3), { iecFormat: true });
    expect(result).to.be.equal('1 GiB');
  });

  it('can convert byte size to MiB string', function () {
    const result = bytesToString(Math.pow(1024, 2), { iecFormat: true });
    expect(result).to.be.equal('1 MiB');
  });

  it('can convert byte size to KiB string', function () {
    const result = bytesToString(1024, { iecFormat: true });
    expect(result).to.be.equal('1 KiB');
  });

  it('can convert byte size to YB string', function () {
    const result = bytesToString(Math.pow(1000, 8), { iecFormat: false });
    expect(result).to.be.equal('1 YB');
  });

  it('can convert byte size to ZB string', function () {
    const result = bytesToString(Math.pow(1000, 7), { iecFormat: false });
    expect(result).to.be.equal('1 ZB');
  });

  it('can convert byte size to EB string', function () {
    const result = bytesToString(Math.pow(1000, 6), { iecFormat: false });
    expect(result).to.be.equal('1 EB');
  });

  it('can convert byte size to PB string', function () {
    const result = bytesToString(Math.pow(1000, 5), { iecFormat: false });
    expect(result).to.be.equal('1 PB');
  });

  it('can convert byte size to TB string', function () {
    const result = bytesToString(Math.pow(1000, 4), { iecFormat: false });
    expect(result).to.be.equal('1 TB');
  });

  it('can convert byte size to GB string', function () {
    const result = bytesToString(Math.pow(1000, 3), { iecFormat: false });
    expect(result).to.be.equal('1 GB');
  });

  it('can convert byte size to MB string', function () {
    const result = bytesToString(Math.pow(1000, 2), { iecFormat: false });
    expect(result).to.be.equal('1 MB');
  });

  it('can convert byte size to KB string', function () {
    const result = bytesToString(1000, { iecFormat: false });
    expect(result).to.be.equal('1 KB');
  });

  it('rounds size in string to 1 digit after comma by default (w/o IEC)', function () {
    const result = bytesToString(1251111, { iecFormat: false });
    expect(result).to.be.equal('1.3 MB');
  });

  it('supports format option with iec', function () {
    const result = bytesToString(1073741824, { format: 'iec' });
    expect(result).to.be.equal('1 GiB');
  });

  it('can convert to bit', function () {
    const result = bytesToString(1, { format: 'bitSi' });
    expect(result).to.be.equal('8 b');
  });

  it('can convert to kbit', function () {
    const result = bytesToString(8000, { format: 'bitSi' });
    expect(result).to.be.equal('64 kb');
  });

  it('can convert to Mbit', function () {
    const result = bytesToString(625000, { format: 'bitSi' });
    expect(result).to.be.equal('5 Mb');
  });

  it('can convert to kibit', function () {
    const result = bytesToString(8192, { format: 'bitIec' });
    expect(result).to.be.equal('64 kib');
  });

  it('can convert to Mibit', function () {
    const result = bytesToString(655360, { format: 'bitIec' });
    expect(result).to.be.equal('5 Mib');
  });

  it('deals with negative values', function () {
    const result = bytesToString(-1024, { iecFormat: true });
    expect(result).to.be.equal('-1 KiB');
  });
});
