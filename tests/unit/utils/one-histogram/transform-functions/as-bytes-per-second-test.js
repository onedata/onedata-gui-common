import { expect } from 'chai';
import { describe, it } from 'mocha';
import asBytesPerSecond from 'onedata-gui-common/utils/one-histogram/transform-functions/as-bytes-per-second';
import { createContext, createConstArgument, expectFunctionsEvaluation } from './helpers';

describe('Unit | Utility | one histogram/transform functions/as bytes per second', function () {
  testAsBytesPerSecond(null, undefined, null);
  testAsBytesPerSecond(NaN, undefined, null);
  testAsBytesPerSecond('abc', undefined, null);

  [undefined, 'iec'].forEach(format => {
    testAsBytesPerSecond(0, format, '0 Bps');
    testAsBytesPerSecond(1024, format, '1 KiBps');
  });
  testAsBytesPerSecond(0, 'si', '0 Bps');
  testAsBytesPerSecond(1000, 'si', '1 KBps');
  testAsBytesPerSecond(0, 'bit', '0 bps');
  testAsBytesPerSecond(128, 'bit', '1 kbps');

  testAsBytesPerSecond([], undefined, []);
  testAsBytesPerSecond([1024, 2048], undefined, ['1 KiBps', '2 KiBps']);
  testAsBytesPerSecond([1000, 2000], 'si', ['1 KBps', '2 KBps']);
  testAsBytesPerSecond([1024, null], undefined, ['1 KiBps', null]);
  testAsBytesPerSecond([{}, NaN], undefined, [null, null]);
});

function testAsBytesPerSecond(rawInput, rawFormat, output) {
  const stringifiedInput = Number.isNaN(rawInput) ? 'NaN' : JSON.stringify(rawInput);
  const stringifiedFormat = JSON.stringify(rawFormat);
  const stringifiedOutput = JSON.stringify(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput} (${stringifiedFormat} format)`, function () {
    const context = createContext();
    const data = createConstArgument(rawInput);
    const format = rawFormat ? createConstArgument(rawFormat) : undefined;

    expect(asBytesPerSecond(context, { data, format })).to.deep.equal(output);
    expectFunctionsEvaluation(context, [data, format]);
  });
}
