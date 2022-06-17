import { expect } from 'chai';
import { describe, it } from 'mocha';
import formatValueWithUnit from 'onedata-gui-common/utils/one-time-series-chart/format-value-with-unit';
import { stringifyArgumentData } from './transform-functions/helpers';

describe('Unit | Utility | one time series chart/format value with unit', function () {
  testFormatValueWithUnit(null, null);
  testFormatValueWithUnit(NaN, null);
  testFormatValueWithUnit('123', null);
  testFormatValueWithUnit({}, null);

  testFormatValueWithUnit(0, '0');
  testFormatValueWithUnit(10, '10');
  testFormatValueWithUnit(-0.1, '-0.1');

  testFormatValueWithUnit(-100, '-100 ms', 'milliseconds');
  testFormatValueWithUnit(-60 * 60 * 1000, '-1 hr', 'milliseconds');
  testFormatValueWithUnit(100, '100 ms', 'milliseconds');
  testFormatValueWithUnit(1500, '1.5 sec', 'milliseconds');
  testFormatValueWithUnit(60 * 60 * 1000, '1 hr', 'milliseconds');
  testFormatValueWithUnit(24 * 60 * 60 * 1000, '1 day', 'milliseconds');
  testFormatValueWithUnit(30 * 24 * 60 * 60 * 1000, '1 mo', 'milliseconds');
  testFormatValueWithUnit(12 * 30 * 24 * 60 * 60 * 1000, '1 year', 'milliseconds');

  testFormatValueWithUnit(-0.1, '-100 ms', 'seconds');
  testFormatValueWithUnit(-60 * 60, '-1 hr', 'seconds');
  testFormatValueWithUnit(0.1, '100 ms', 'seconds');
  testFormatValueWithUnit(1.5, '1.5 sec', 'seconds');
  testFormatValueWithUnit(60 * 60, '1 hr', 'seconds');
  testFormatValueWithUnit(24 * 60 * 60, '1 day', 'seconds');
  testFormatValueWithUnit(30 * 24 * 60 * 60, '1 mo', 'seconds');
  testFormatValueWithUnit(12 * 30 * 24 * 60 * 60, '1 year', 'seconds');

  testFormatValueWithUnit(0, '0 B', 'bytes');
  testFormatValueWithUnit(1000, '1000 B', 'bytes');
  testFormatValueWithUnit(1024, '1 KiB', 'bytes');
  testFormatValueWithUnit(1536, '1.5 KiB', 'bytes');
  testFormatValueWithUnit(-1024, '-1 KiB', 'bytes');

  testFormatValueWithUnit(0, '0 B', 'bytes', { format: 'si' });
  testFormatValueWithUnit(1000, '1 kB', 'bytes', { format: 'si' });
  testFormatValueWithUnit(1024, '1 kB', 'bytes', { format: 'si' });
  testFormatValueWithUnit(1500, '1.5 kB', 'bytes', { format: 'si' });
  testFormatValueWithUnit(-1000, '-1 kB', 'bytes', { format: 'si' });

  testFormatValueWithUnit(0, '0 b', 'bits');
  testFormatValueWithUnit(1000, '1000 b', 'bits');
  testFormatValueWithUnit(1024, '1 Kib', 'bits');
  testFormatValueWithUnit(1536, '1.5 Kib', 'bits');
  testFormatValueWithUnit(-1024, '-1 Kib', 'bits');

  testFormatValueWithUnit(0, '0 b', 'bits', { format: 'si' });
  testFormatValueWithUnit(1000, '1 kb', 'bits', { format: 'si' });
  testFormatValueWithUnit(1024, '1 kb', 'bits', { format: 'si' });
  testFormatValueWithUnit(1500, '1.5 kb', 'bits', { format: 'si' });
  testFormatValueWithUnit(-1000, '-1 kb', 'bits', { format: 'si' });

  testFormatValueWithUnit(0, '0 B/s', 'bytesPerSec');
  testFormatValueWithUnit(1000, '1000 B/s', 'bytesPerSec');
  testFormatValueWithUnit(1024, '1 KiB/s', 'bytesPerSec');
  testFormatValueWithUnit(1536, '1.5 KiB/s', 'bytesPerSec');
  testFormatValueWithUnit(-1024, '-1 KiB/s', 'bytesPerSec');

  testFormatValueWithUnit(0, '0 B/s', 'bytesPerSec', { format: 'si' });
  testFormatValueWithUnit(1000, '1 kB/s', 'bytesPerSec', { format: 'si' });
  testFormatValueWithUnit(1024, '1 kB/s', 'bytesPerSec', { format: 'si' });
  testFormatValueWithUnit(1500, '1.5 kB/s', 'bytesPerSec', { format: 'si' });
  testFormatValueWithUnit(-1000, '-1 kB/s', 'bytesPerSec', { format: 'si' });

  testFormatValueWithUnit(0, '0 b/s', 'bitsPerSec');
  testFormatValueWithUnit(1000, '1000 b/s', 'bitsPerSec');
  testFormatValueWithUnit(1024, '1 Kib/s', 'bitsPerSec');
  testFormatValueWithUnit(1536, '1.5 Kib/s', 'bitsPerSec');
  testFormatValueWithUnit(-1024, '-1 Kib/s', 'bitsPerSec');

  testFormatValueWithUnit(0, '0 b/s', 'bitsPerSec', { format: 'si' });
  testFormatValueWithUnit(1000, '1 kb/s', 'bitsPerSec', { format: 'si' });
  testFormatValueWithUnit(1024, '1 kb/s', 'bitsPerSec', { format: 'si' });
  testFormatValueWithUnit(1500, '1.5 kb/s', 'bitsPerSec', { format: 'si' });
  testFormatValueWithUnit(-1000, '-1 kb/s', 'bitsPerSec', { format: 'si' });

  testFormatValueWithUnit(0, '0 Hz', 'hertz');
  testFormatValueWithUnit(1000, '1 kHz', 'hertz');
  testFormatValueWithUnit(1500, '1.5 kHz', 'hertz');
  testFormatValueWithUnit(-1000, '-1 kHz', 'hertz');

  testFormatValueWithUnit(0, '0 c/s', 'countsPerSec');
  testFormatValueWithUnit(1000, '1K c/s', 'countsPerSec');
  testFormatValueWithUnit(1500, '1.5K c/s', 'countsPerSec');
  testFormatValueWithUnit(-1000, '-1K c/s', 'countsPerSec');

  testFormatValueWithUnit(0, '0 ops/s', 'operationsPerSec');
  testFormatValueWithUnit(1000, '1K ops/s', 'operationsPerSec');
  testFormatValueWithUnit(1500, '1.5K ops/s', 'operationsPerSec');
  testFormatValueWithUnit(-1000, '-1K ops/s', 'operationsPerSec');

  testFormatValueWithUnit(0, '0 req/s', 'requestsPerSec');
  testFormatValueWithUnit(1000, '1K req/s', 'requestsPerSec');
  testFormatValueWithUnit(1500, '1.5K req/s', 'requestsPerSec');
  testFormatValueWithUnit(-1000, '-1K req/s', 'requestsPerSec');

  testFormatValueWithUnit(0, '0 rd/s', 'readsPerSec');
  testFormatValueWithUnit(1000, '1K rd/s', 'readsPerSec');
  testFormatValueWithUnit(1500, '1.5K rd/s', 'readsPerSec');
  testFormatValueWithUnit(-1000, '-1K rd/s', 'readsPerSec');

  testFormatValueWithUnit(0, '0 wr/s', 'writesPerSec');
  testFormatValueWithUnit(1000, '1K wr/s', 'writesPerSec');
  testFormatValueWithUnit(1500, '1.5K wr/s', 'writesPerSec');
  testFormatValueWithUnit(-1000, '-1K wr/s', 'writesPerSec');

  testFormatValueWithUnit(0, '0 io/s', 'ioOperationsPerSec');
  testFormatValueWithUnit(1000, '1K io/s', 'ioOperationsPerSec');
  testFormatValueWithUnit(1500, '1.5K io/s', 'ioOperationsPerSec');
  testFormatValueWithUnit(-1000, '-1K io/s', 'ioOperationsPerSec');

  testFormatValueWithUnit(0, '0%', 'percent');
  testFormatValueWithUnit(100, '100%', 'percent');
  testFormatValueWithUnit(0.5, '0.5%', 'percent');
  testFormatValueWithUnit(-1, '-1%', 'percent');

  testFormatValueWithUnit(0, '0%', 'percentNormalized');
  testFormatValueWithUnit(100, '10000%', 'percentNormalized');
  testFormatValueWithUnit(0.5, '50%', 'percentNormalized');
  testFormatValueWithUnit(-1, '-100%', 'percentNormalized');

  testFormatValueWithUnit(0, 'False', 'boolean');
  testFormatValueWithUnit(1, 'True', 'boolean');
  testFormatValueWithUnit(0.5, 'True', 'boolean');
  testFormatValueWithUnit(100, 'True', 'boolean');
  testFormatValueWithUnit(-1, 'True', 'boolean');

  testFormatValueWithUnit(0, '0', 'custom');
  testFormatValueWithUnit(1000, '1000', 'custom');
  testFormatValueWithUnit(0.5, '0.5', 'custom');
  testFormatValueWithUnit(-1, '-1', 'custom');

  testFormatValueWithUnit(0, '0', 'custom', { useMetricSuffix: true });
  testFormatValueWithUnit(1000, '1K', 'custom', { useMetricSuffix: true });
  testFormatValueWithUnit(0.5, '0.5', 'custom', { useMetricSuffix: true });
  testFormatValueWithUnit(-1, '-1', 'custom', { useMetricSuffix: true });

  testFormatValueWithUnit(0, '0 km', 'custom', { customName: 'km' });
  testFormatValueWithUnit(1000, '1000 km', 'custom', { customName: 'km' });
  testFormatValueWithUnit(0.5, '0.5 km', 'custom', { customName: 'km' });
  testFormatValueWithUnit(-1, '-1 km', 'custom', { customName: 'km' });

  testFormatValueWithUnit(0, '0 km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
  testFormatValueWithUnit(1000, '1K km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
  testFormatValueWithUnit(0.5, '0.5 km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
  testFormatValueWithUnit(-1, '-1 km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
});

function testFormatValueWithUnit(value, output, unitName, unitOptions) {
  const stringifiedInput = stringifyArgumentData(value);
  const stringifiedUnitName = stringifyArgumentData(unitName);
  const stringifiedUnitOptions = stringifyArgumentData(unitOptions);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput} and ${stringifiedUnitName} unit${unitOptions ? ` options (${stringifiedUnitOptions})` : ''}`,
    function () {
      expect(formatValueWithUnit({ value, unitName, unitOptions }))
        .to.deep.equal(output);
    });
}
