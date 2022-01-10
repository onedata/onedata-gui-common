import { expect } from 'chai';
import { describe, it } from 'mocha';
import multiply from 'onedata-gui-common/utils/one-histogram/transform-functions/multiply';

import { createContext, expectFunctionsEvaluation } from './helpers';

describe('Unit | Utility | one histogram/transform functions/multiply', function () {
  testMultiply(123, null);
  testMultiply([], null);
  testMultiply({}, null);
  testMultiply(null, null);
  testMultiply(NaN, null);
  testMultiply('abc', null);

  testMultiply([2], 2);
  testMultiply([2, 3], 6);
  testMultiply([2, 3, -4], -24);
  testMultiply([2, {}], null);
  testMultiply([2, null], null);
  testMultiply([2, NaN], null);
  testMultiply([2, 'abc'], null);

  testMultiply([2, []], []);
  testMultiply([2, [3]], [6]);
  testMultiply([2, [3, 4]], [6, 8]);
  testMultiply([2, [3, {}]], [6, null]);
  testMultiply([2, [3, null]], [6, null]);
  testMultiply([2, [3, NaN]], [6, null]);
  testMultiply([2, [3, 'abc']], [6, null]);
  testMultiply([
    [3],
    2,
  ], [6]);

  testMultiply([
    [],
    [],
  ], []);
  testMultiply([
    [2],
    [3],
  ], [6]);
  testMultiply([
    [2, 4],
    [3, 6],
  ], [6, 24]);
  testMultiply([
    [2, 4, 8],
    [3, 6],
  ], null);
  testMultiply([
    [2, 4],
    [3, 6, 9],
  ], null);

  testMultiply([
    [1, 2],
    3,
    [4, 5],
    6,
  ], [72, 180]);
  testMultiply([
    [1, 2, 3],
    [1, 2, null],
    [null, 2, 3],
  ], [null, 8, null]);
});

function testMultiply(rawOperands, output) {
  const stringifiedInput = Number.isNaN(rawOperands) ? 'NaN' : JSON.stringify(rawOperands);
  const stringifiedOutput = JSON.stringify(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput} operand(s)`, function () {
    const context = createContext();

    expect(multiply(context, { operands: rawOperands })).to.deep.equal(output);
    expectFunctionsEvaluation(context, Array.isArray(rawOperands) ? rawOperands : []);
  });
}
