import { expect } from 'chai';
import { describe, it } from 'mocha';
import formatWithUnit from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/format-with-unit';
import {
  createContext,
  createConstArgument,
  expectFunctionsEvaluation,
  stringifyArgumentData,
} from './helpers';

describe('Unit | Utility | one time series chart/transform functions/format with unit', function () {
  testFormatWithUnit(null, null);
  testFormatWithUnit(NaN, null);
  testFormatWithUnit('123', null);
  testFormatWithUnit({}, null);

  testFormatWithUnit(0, '0');
  testFormatWithUnit(10, '10');
  testFormatWithUnit(-0.1, '-0.1');

  testFormatWithUnit(-100, '-100 ms', 'milliseconds');
  testFormatWithUnit(-60 * 60 * 1000, '-1 hr', 'milliseconds');
  testFormatWithUnit(100, '100 ms', 'milliseconds');
  testFormatWithUnit(1500, '1.5 sec', 'milliseconds');
  testFormatWithUnit(60 * 60 * 1000, '1 hr', 'milliseconds');
  testFormatWithUnit(24 * 60 * 60 * 1000, '1 day', 'milliseconds');
  testFormatWithUnit(30 * 24 * 60 * 60 * 1000, '1 mo', 'milliseconds');
  testFormatWithUnit(12 * 30 * 24 * 60 * 60 * 1000, '1 year', 'milliseconds');

  testFormatWithUnit(-0.1, '-100 ms', 'seconds');
  testFormatWithUnit(-60 * 60, '-1 hr', 'seconds');
  testFormatWithUnit(0.1, '100 ms', 'seconds');
  testFormatWithUnit(1.5, '1.5 sec', 'seconds');
  testFormatWithUnit(60 * 60, '1 hr', 'seconds');
  testFormatWithUnit(24 * 60 * 60, '1 day', 'seconds');
  testFormatWithUnit(30 * 24 * 60 * 60, '1 mo', 'seconds');
  testFormatWithUnit(12 * 30 * 24 * 60 * 60, '1 year', 'seconds');

  testFormatWithUnit(0, '0 B', 'bytes');
  testFormatWithUnit(1000, '1000 B', 'bytes');
  testFormatWithUnit(1024, '1 KiB', 'bytes');
  testFormatWithUnit(1536, '1.5 KiB', 'bytes');
  testFormatWithUnit(-1024, '-1 KiB', 'bytes');

  testFormatWithUnit(0, '0 B', 'bytes', { format: 'si' });
  testFormatWithUnit(1000, '1 kB', 'bytes', { format: 'si' });
  testFormatWithUnit(1024, '1 kB', 'bytes', { format: 'si' });
  testFormatWithUnit(1500, '1.5 kB', 'bytes', { format: 'si' });
  testFormatWithUnit(-1000, '-1 kB', 'bytes', { format: 'si' });

  testFormatWithUnit(0, '0 b', 'bits');
  testFormatWithUnit(1000, '1000 b', 'bits');
  testFormatWithUnit(1024, '1 Kib', 'bits');
  testFormatWithUnit(1536, '1.5 Kib', 'bits');
  testFormatWithUnit(-1024, '-1 Kib', 'bits');

  testFormatWithUnit(0, '0 b', 'bits', { format: 'si' });
  testFormatWithUnit(1000, '1 kb', 'bits', { format: 'si' });
  testFormatWithUnit(1024, '1 kb', 'bits', { format: 'si' });
  testFormatWithUnit(1500, '1.5 kb', 'bits', { format: 'si' });
  testFormatWithUnit(-1000, '-1 kb', 'bits', { format: 'si' });

  testFormatWithUnit(0, '0 B/s', 'bytesPerSec');
  testFormatWithUnit(1000, '1000 B/s', 'bytesPerSec');
  testFormatWithUnit(1024, '1 KiB/s', 'bytesPerSec');
  testFormatWithUnit(1536, '1.5 KiB/s', 'bytesPerSec');
  testFormatWithUnit(-1024, '-1 KiB/s', 'bytesPerSec');

  testFormatWithUnit(0, '0 B/s', 'bytesPerSec', { format: 'si' });
  testFormatWithUnit(1000, '1 kB/s', 'bytesPerSec', { format: 'si' });
  testFormatWithUnit(1024, '1 kB/s', 'bytesPerSec', { format: 'si' });
  testFormatWithUnit(1500, '1.5 kB/s', 'bytesPerSec', { format: 'si' });
  testFormatWithUnit(-1000, '-1 kB/s', 'bytesPerSec', { format: 'si' });

  testFormatWithUnit(0, '0 b/s', 'bitsPerSec');
  testFormatWithUnit(1000, '1000 b/s', 'bitsPerSec');
  testFormatWithUnit(1024, '1 Kib/s', 'bitsPerSec');
  testFormatWithUnit(1536, '1.5 Kib/s', 'bitsPerSec');
  testFormatWithUnit(-1024, '-1 Kib/s', 'bitsPerSec');

  testFormatWithUnit(0, '0 b/s', 'bitsPerSec', { format: 'si' });
  testFormatWithUnit(1000, '1 kb/s', 'bitsPerSec', { format: 'si' });
  testFormatWithUnit(1024, '1 kb/s', 'bitsPerSec', { format: 'si' });
  testFormatWithUnit(1500, '1.5 kb/s', 'bitsPerSec', { format: 'si' });
  testFormatWithUnit(-1000, '-1 kb/s', 'bitsPerSec', { format: 'si' });

  testFormatWithUnit(0, '0 Hz', 'hertz');
  testFormatWithUnit(1000, '1 kHz', 'hertz');
  testFormatWithUnit(1500, '1.5 kHz', 'hertz');
  testFormatWithUnit(-1000, '-1 kHz', 'hertz');

  testFormatWithUnit(0, '0 c/s', 'countsPerSec');
  testFormatWithUnit(1000, '1K c/s', 'countsPerSec');
  testFormatWithUnit(1500, '1.5K c/s', 'countsPerSec');
  testFormatWithUnit(-1000, '-1K c/s', 'countsPerSec');

  testFormatWithUnit(0, '0 ops/s', 'operationsPerSec');
  testFormatWithUnit(1000, '1K ops/s', 'operationsPerSec');
  testFormatWithUnit(1500, '1.5K ops/s', 'operationsPerSec');
  testFormatWithUnit(-1000, '-1K ops/s', 'operationsPerSec');

  testFormatWithUnit(0, '0 req/s', 'requestsPerSec');
  testFormatWithUnit(1000, '1K req/s', 'requestsPerSec');
  testFormatWithUnit(1500, '1.5K req/s', 'requestsPerSec');
  testFormatWithUnit(-1000, '-1K req/s', 'requestsPerSec');

  testFormatWithUnit(0, '0 rd/s', 'readsPerSec');
  testFormatWithUnit(1000, '1K rd/s', 'readsPerSec');
  testFormatWithUnit(1500, '1.5K rd/s', 'readsPerSec');
  testFormatWithUnit(-1000, '-1K rd/s', 'readsPerSec');

  testFormatWithUnit(0, '0 wr/s', 'writesPerSec');
  testFormatWithUnit(1000, '1K wr/s', 'writesPerSec');
  testFormatWithUnit(1500, '1.5K wr/s', 'writesPerSec');
  testFormatWithUnit(-1000, '-1K wr/s', 'writesPerSec');

  testFormatWithUnit(0, '0 io/s', 'ioOperationsPerSec');
  testFormatWithUnit(1000, '1K io/s', 'ioOperationsPerSec');
  testFormatWithUnit(1500, '1.5K io/s', 'ioOperationsPerSec');
  testFormatWithUnit(-1000, '-1K io/s', 'ioOperationsPerSec');

  testFormatWithUnit(0, '0%', 'percent');
  testFormatWithUnit(100, '100%', 'percent');
  testFormatWithUnit(0.5, '0.5%', 'percent');
  testFormatWithUnit(-1, '-1%', 'percent');

  testFormatWithUnit(0, '0%', 'percentNormalized');
  testFormatWithUnit(100, '10000%', 'percentNormalized');
  testFormatWithUnit(0.5, '50%', 'percentNormalized');
  testFormatWithUnit(-1, '-100%', 'percentNormalized');

  testFormatWithUnit(0, 'False', 'boolean');
  testFormatWithUnit(1, 'True', 'boolean');
  testFormatWithUnit(0.5, 'True', 'boolean');
  testFormatWithUnit(100, 'True', 'boolean');
  testFormatWithUnit(-1, 'True', 'boolean');

  testFormatWithUnit(0, '0', 'custom');
  testFormatWithUnit(1000, '1000', 'custom');
  testFormatWithUnit(0.5, '0.5', 'custom');
  testFormatWithUnit(-1, '-1', 'custom');

  testFormatWithUnit(0, '0', 'custom', { useMetricSuffix: true });
  testFormatWithUnit(1000, '1K', 'custom', { useMetricSuffix: true });
  testFormatWithUnit(0.5, '0.5', 'custom', { useMetricSuffix: true });
  testFormatWithUnit(-1, '-1', 'custom', { useMetricSuffix: true });

  testFormatWithUnit(0, '0 km', 'custom', { customName: 'km' });
  testFormatWithUnit(1000, '1000 km', 'custom', { customName: 'km' });
  testFormatWithUnit(0.5, '0.5 km', 'custom', { customName: 'km' });
  testFormatWithUnit(-1, '-1 km', 'custom', { customName: 'km' });

  testFormatWithUnit(0, '0 km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
  testFormatWithUnit(1000, '1K km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
  testFormatWithUnit(0.5, '0.5 km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
  testFormatWithUnit(-1, '-1 km', 'custom', {
    useMetricSuffix: true,
    customName: 'km',
  });
});

function testFormatWithUnit(rawInput, output, rawUnitName, rawUnitOptions) {
  const stringifiedInput = stringifyArgumentData(rawInput);
  const stringifiedUnitName = stringifyArgumentData(rawUnitName);
  const stringifiedUnitOptions = stringifyArgumentData(rawUnitOptions);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput} and ${stringifiedUnitName} unit${rawUnitOptions ? ` options (${stringifiedUnitOptions})` : ''}`,
    function () {
      const context = createContext();
      const data = createConstArgument(rawInput);
      const unitName = rawUnitName ? createConstArgument(rawUnitName) : undefined;
      const unitOptions = rawUnitOptions ?
        createConstArgument(rawUnitOptions) : undefined;

      expect(formatWithUnit(context, { data, unitName, unitOptions }))
        .to.deep.equal(output);
      expectFunctionsEvaluation(context, [data, unitName, unitOptions]);
    });
}
