import { expect } from 'chai';
import { describe, it } from 'mocha';
import multiply from 'onedata-gui-common/utils/one-time-series-chart/series-functions/multiply';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';
import { createContext, expectFunctionsEvaluation, createConstArgument, stringifyArgumentData } from './helpers';
import { casesToCheck as transformCasesToCheck } from '../transform-functions/multiply-test';

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
    { type: 'points', data: [point(1, 2), point(2, 3)] },
    { type: 'points', data: [point(1, 4), point(2, 5)] },
  ],
  output: { type: 'points', data: [point(1, 8), point(2, 15)] },
}, {
  input: [
    { type: 'points', data: [point(1, 2), point(2, null)] },
    { type: 'points', data: [point(1, 4), point(2, 5)] },
  ],
  output: { type: 'points', data: [point(1, 8), point(2, null)] },
}, {
  input: [
    { type: 'points', data: [point(1, 2), point(2, 3)] },
    { type: 'basic', data: 2 },
    { type: 'points', data: [point(1, 4), point(2, 5)] },
  ],
  output: { type: 'points', data: [point(1, 16), point(2, 30)] },
}, {
  input: [
    { type: 'points', data: [point(1, 2), point(2, 3)] },
    { type: 'basic', data: [1, 2] },
    { type: 'points', data: [point(1, 4), point(2, 5)] },
  ],
  output: { type: 'points', data: [point(1, 8), point(2, 30)] },
}, {
  input: [
    { type: 'points', data: [point(1, 2), point(2, 3)] },
    { type: 'basic', data: null },
    { type: 'points', data: [point(1, 4), point(2, 5)] },
  ],
  output: { type: 'points', data: [point(1, null), point(2, null)] },
}, {
  input: [
    { type: 'points', data: [point(1, 2), point(2, 3)] },
    { type: 'basic', data: 5 },
    { type: 'points', data: [point(2, 4), point(3, 5)] },
  ],
  output: { type: 'points', data: [point(2, 60), point(3, null)] },
}];

describe('Unit | Utility | one time series chart/series functions/multiply', function () {
  casesToCheck.forEach(({ input, output }) => testMultiply(input, output));
});

function testMultiply(rawOperands, output) {
  const stringifiedInput = stringifyArgumentData(rawOperands);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}`, async function () {
    const context = createContext();

    const preparedOperands = Array.isArray(rawOperands) ?
      rawOperands.map(operand => createConstArgument(operand)) :
      createConstArgument(rawOperands);
    expect(await multiply(context, { operands: preparedOperands })).to.deep.equal(output);
    expectFunctionsEvaluation(
      context,
      Array.isArray(rawOperands) ? preparedOperands : []
    );
  });
}
