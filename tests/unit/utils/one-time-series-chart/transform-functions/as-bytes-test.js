import { expect } from 'chai';
import { describe, it } from 'mocha';
import asBytes from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/as-bytes';
import {
  createContext,
  createConstArgument,
  expectFunctionsEvaluation,
  stringifyArgumentData,
} from './helpers';

describe('Unit | Utility | one time series chart/transform functions/as bytes', function () {
  testAsBytes(null, undefined, null);
  testAsBytes(NaN, undefined, null);
  testAsBytes('abc', undefined, null);

  [undefined, 'iec'].forEach(format => {
    testAsBytes(0, format, '0 B');
    testAsBytes(1024, format, '1 KiB');
  });
  testAsBytes(0, 'si', '0 B');
  testAsBytes(1000, 'si', '1 KB');
  testAsBytes(0, 'bit', '0 b');
  testAsBytes(128, 'bit', '1 kb');

  testAsBytes([], undefined, []);
  testAsBytes([1024, 2048], undefined, ['1 KiB', '2 KiB']);
  testAsBytes([1000, 2000], 'si', ['1 KB', '2 KB']);
  testAsBytes([1024, null], undefined, ['1 KiB', null]);
  testAsBytes([{}, NaN], undefined, [null, null]);
});

function testAsBytes(rawInput, rawFormat, output) {
  const stringifiedInput = stringifyArgumentData(rawInput);
  const stringifiedFormat = stringifyArgumentData(rawFormat);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput} (${stringifiedFormat} format)`, function () {
    const context = createContext();
    const data = createConstArgument(rawInput);
    const format = rawFormat ? createConstArgument(rawFormat) : undefined;

    expect(asBytes(context, { data, format })).to.deep.equal(output);
    expectFunctionsEvaluation(context, [data, format]);
  });
}
