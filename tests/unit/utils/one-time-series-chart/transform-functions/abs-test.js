import { expect } from 'chai';
import { describe, it } from 'mocha';
import abs from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/abs';
import {
  createContext,
  createConstArgument,
  expectFunctionsEvaluation,
  stringifyArgumentData,
} from './helpers';

export const casesToCheck = [{
  input: -10,
  output: 10,
}, {
  input: 10,
  output: 10,
}, {
  input: 0,
  output: 0,
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
  input: [],
  output: [],
}, {
  input: [-10, -20],
  output: [10, 20],
}, {
  input: [10, -20],
  output: [10, 20],
}, {
  input: [10, null],
  output: [10, null],
}, {
  input: [{}, NaN],
  output: [null, null],
}];

describe('Unit | Utility | one time series chart/transform functions/abs', function () {
  casesToCheck.forEach(({ input, output }) => testAbs(input, output));
});

function testAbs(input, output) {
  const stringifiedInput = stringifyArgumentData(input);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}`, function () {
    const context = createContext();
    const data = createConstArgument(input);

    expect(abs(context, { data })).to.deep.equal(output);
    expectFunctionsEvaluation(context, [data]);
  });
}
