import { expect } from 'chai';
import { describe, it } from 'mocha';
import abs from 'onedata-gui-common/utils/one-histogram/series-functions/abs';
import { point, createContext, createConstArgument, expectFunctionsEvaluation } from './helpers';

describe('Unit | Utility | one histogram/series functions/abs', function () {
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

  testAbs([point(1, -10), point(2, -20)], [point(1, 10), point(2, 20)]);
  testAbs([point(1, 10), point(2, -20)], [point(1, 10), point(2, 20)]);
  testAbs([point(1, 10), point(2, null)], [point(1, 10), point(2, null)]);
  testAbs([point(1, {}), point(2, NaN)], [point(1, null), point(2, null)]);
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
