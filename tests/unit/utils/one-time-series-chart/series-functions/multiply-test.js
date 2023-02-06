import { expect } from 'chai';
import { describe, it } from 'mocha';
import multiply from 'onedata-gui-common/utils/one-time-series-chart/series-functions/multiply';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';
import {
  createContext,
  expectFunctionsEvaluation,
  createConstArgument,
  stringifyArgumentData,
} from './helpers';
import {
  casesToCheck as transformCasesToCheck,
} from '../transform-functions/multiply-test';

const normalizedTransformCasesToCheck =
  transformCasesToCheck.map(({ input, output }) => ({
    input: Array.isArray(input) ?
      input.map(operand => ({ type: 'basic', data: operand })) : { type: 'basic', data: input },
    output: {
      type: 'basic',
      data: output,
    },
  }));

const casesToCheck = [...normalizedTransformCasesToCheck, {
  input: [
    { type: 'points', data: [new Point(1, 2), new Point(2, 3)] },
    { type: 'points', data: [new Point(1, 4), new Point(2, 5)] },
  ],
  output: { type: 'points', data: [new Point(1, 8), new Point(2, 15)] },
}, {
  input: [
    { type: 'points', data: [new Point(1, 2), new Point(2, null)] },
    { type: 'points', data: [new Point(1, 4), new Point(2, 5)] },
  ],
  output: { type: 'points', data: [new Point(1, 8), new Point(2, null)] },
}, {
  input: [
    { type: 'points', data: [new Point(1, 2), new Point(2, 3)] },
    { type: 'basic', data: 2 },
    { type: 'points', data: [new Point(1, 4), new Point(2, 5)] },
  ],
  output: { type: 'points', data: [new Point(1, 16), new Point(2, 30)] },
}, {
  input: [
    { type: 'points', data: [new Point(1, 2), new Point(2, 3)] },
    { type: 'basic', data: [1, 2] },
    { type: 'points', data: [new Point(1, 4), new Point(2, 5)] },
  ],
  output: { type: 'points', data: [new Point(1, 8), new Point(2, 30)] },
}, {
  input: [
    { type: 'points', data: [new Point(1, 2), new Point(2, 3)] },
    { type: 'basic', data: null },
    { type: 'points', data: [new Point(1, 4), new Point(2, 5)] },
  ],
  output: { type: 'points', data: [new Point(1, null), new Point(2, null)] },
}, {
  input: [
    { type: 'points', data: [new Point(1, 2), new Point(2, 3)] },
    { type: 'basic', data: 5 },
    { type: 'points', data: [new Point(2, 4), new Point(3, 5)] },
  ],
  output: { type: 'points', data: [new Point(2, 60), new Point(3, null)] },
}];

describe('Unit | Utility | one time series chart/series functions/multiply', function () {
  casesToCheck.forEach(({ input, output }) => testMultiply(input, output));
});

function testMultiply(rawOperands, output) {
  const stringifiedInput = stringifyArgumentData(rawOperands);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}`, async function () {
    const context = createContext();

    const operandProviders = Array.isArray(rawOperands) ?
      rawOperands.map(operand => createConstArgument(operand)) :
      createConstArgument(rawOperands);
    expect(await multiply(context, { operandProviders })).to.deep.equal(output);
    expectFunctionsEvaluation(
      context,
      Array.isArray(operandProviders) ? operandProviders : []
    );
  });
}
