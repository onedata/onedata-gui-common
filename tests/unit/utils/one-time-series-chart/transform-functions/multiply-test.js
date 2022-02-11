import { expect } from 'chai';
import { describe, it } from 'mocha';
import multiply from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/multiply';
import { createContext, expectFunctionsEvaluation, stringifyArgumentData } from './helpers';

export const casesToCheck = [{
  input: 123,
  output: null,
}, {
  input: [],
  output: null,
}, {
  input: {},
  output: null,
}, {
  input: null,
  output: null,
}, {
  input: NaN,
  output: null,
}, {
  input: 'abc',
  output: null,
}, {
  input: [2],
  output: 2,
}, {
  input: [2, 3],
  output: 6,
}, {
  input: [2, 3, -4],
  output: -24,
}, {
  input: [2, {}],
  output: null,
}, {
  input: [2, null],
  output: null,
}, {
  input: [2, NaN],
  output: null,
}, {
  input: [2, 'abc'],
  output: null,
}, {
  input: [2, []],
  output: [],
}, {
  input: [2, [3]],
  output: [6],
}, {
  input: [2, [3, 4]],
  output: [6, 8],
}, {
  input: [2, [3, {}]],
  output: [6, null],
}, {
  input: [2, [3, null]],
  output: [6, null],
}, {
  input: [2, [3, NaN]],
  output: [6, null],
}, {
  input: [2, [3, 'abc']],
  output: [6, null],
}, {
  input: [
    [3],
    2,
  ],
  output: [6],
}, {
  input: [
    [],
    [],
  ],
  output: [],
}, {
  input: [
    [2],
    [3],
  ],
  output: [6],
}, {
  input: [
    [2, 4],
    [3, 6],
  ],
  output: [6, 24],
}, {
  input: [
    [2, 4, 8],
    [3, 6],
  ],
  output: null,
}, {
  input: [
    [2, 4],
    [3, 6, 9],
  ],
  output: null,
}, {
  input: [
    [1, 2],
    3,
    [4, 5],
    6,
  ],
  output: [72, 180],
}, {
  input: [
    [1, 2, 3],
    [1, 2, null],
    [null, 2, 3],
  ],
  output: [null, 8, null],
}];

describe('Unit | Utility | one time series chart/transform functions/multiply', function () {
  casesToCheck.forEach(({ input, output }) => testMultiply(input, output));
});

function testMultiply(rawOperands, output) {
  const stringifiedInput = stringifyArgumentData(rawOperands);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput} operand(s)`, function () {
    const context = createContext();

    expect(multiply(context, { operands: rawOperands })).to.deep.equal(output);
    expectFunctionsEvaluation(context, Array.isArray(rawOperands) ? rawOperands : []);
  });
}
