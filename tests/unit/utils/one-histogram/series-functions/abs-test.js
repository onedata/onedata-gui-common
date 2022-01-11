import { expect } from 'chai';
import { describe, it } from 'mocha';
import abs from 'onedata-gui-common/utils/one-histogram/series-functions/abs';
import { point, createContext, createConstArgument, expectFunctionsEvaluation } from './helpers';
import { casesToCheck as transformCasesToCheck } from '../transform-functions/abs-test';

const casesToCheck = [...transformCasesToCheck, {
  input: [point(1, -10), point(2, -20)],
  output: [point(1, 10), point(2, 20)],
}, {
  input: [point(1, 10), point(2, -20)],
  output: [point(1, 10), point(2, 20)],
}, {
  input: [point(1, 10), point(2, null)],
  output: [point(1, 10), point(2, null)],
}, {
  input: [point(1, {}), point(2, NaN)],
  output: [point(1, null), point(2, null)],
}];

describe('Unit | Utility | one histogram/series functions/abs', function () {
  casesToCheck.forEach(({ input, output }) => testAbs(input, output));
});

function testAbs(input, output) {
  const stringifiedInput = Number.isNaN(input) ? 'NaN' : JSON.stringify(input);
  const stringifiedOutput = JSON.stringify(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}`, async function () {
    const context = createContext();
    const data = createConstArgument(input);

    expect(await abs(context, { data })).to.deep.equal(output);
    expectFunctionsEvaluation(context, [data]);
  });
}
