import { expect } from 'chai';
import { describe, it } from 'mocha';
import multiply from 'onedata-gui-common/utils/one-histogram/series-functions/multiply';
import { point, createContext, expectFunctionsEvaluation } from './helpers';
import { casesToCheck as transformCasesToCheck } from '../transform-functions/multiply-test';

const casesToCheck = [...transformCasesToCheck, {
  input: [
    [point(1, 2), point(2, 3)],
    [point(1, 4), point(2, 5)],
  ],
  output: [point(1, 8), point(2, 15)],
}, {
  input: [
    [point(1, 2), point(2, null)],
    [point(1, 4), point(2, 5)],
  ],
  output: [point(1, 8), point(2, null)],
}, {
  input: [
    [point(1, 2), point(2, 3)],
    2,
    [point(1, 4), point(2, 5)],
  ],
  output: [point(1, 16), point(2, 30)],
}, {
  input: [
    [point(1, 2), point(2, 3)],
    2,
    [point(1, 4), point(2, 5)],
  ],
  output: [point(1, 16), point(2, 30)],
}, {
  input: [
    [point(1, 2), point(2, 3)],
    [1, 2],
    [point(1, 4), point(2, 5)],
  ],
  output: [point(1, 8), point(2, 30)],
}, {
  input: [
    [point(1, 2), point(2, 3)],
    null,
    [point(1, 4), point(2, 5)],
  ],
  output: [point(1, null), point(2, null)],
}];

describe('Unit | Utility | one histogram/series functions/multiply', function () {
  casesToCheck.forEach(({ input, output }) => testMultiply(input, output));
});

function testMultiply(rawOperands, output) {
  const stringifiedInput = Number.isNaN(rawOperands) ? 'NaN' : JSON.stringify(rawOperands);
  const stringifiedOutput = JSON.stringify(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}`, async function () {
    const context = createContext();

    expect(await multiply(context, { operands: rawOperands })).to.deep.equal(output);
    expectFunctionsEvaluation(context, Array.isArray(rawOperands) ? rawOperands : []);
  });
}
