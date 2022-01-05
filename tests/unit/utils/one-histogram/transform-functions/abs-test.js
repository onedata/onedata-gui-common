import { expect } from 'chai';
import { describe, it } from 'mocha';
import abs from 'onedata-gui-common/utils/one-histogram/transform-functions/abs';
import { createContext, createConstArgument, expectFunctionsEvaluation } from './helpers';

describe('Unit | Utility | one histogram/transform functions/abs', function () {
  testAbs(-10, 10);
  testAbs(10, 10);
  testAbs(0, 0);
  testAbs(null, null);
  testAbs(NaN, null);
  testAbs('abc', null);

  testAbs([], []);

  testAbs([-10, -20], [10, 20]);
  testAbs([10, -20], [10, 20]);
  testAbs([10, null], [10, null]);
  testAbs([{}, NaN], [null, null]);
});

function testAbs(input, output) {
  const stringifiedInput = Number.isNaN(input) ? 'NaN' : JSON.stringify(input);
  const stringifiedOutput = JSON.stringify(output);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}`, function () {
    const context = createContext();
    const data = createConstArgument(input);

    expect(abs(context, { data })).to.deep.equal(output);
    expectFunctionsEvaluation(context, [data]);
  });
}
