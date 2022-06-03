// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import abs from 'onedata-gui-common/utils/one-time-series-chart/series-functions/abs';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';
import {
  createContext,
  createConstArgument,
  expectFunctionsEvaluation,
  stringifyArgumentData,
} from './helpers';
import {
  casesToCheck as transformCasesToCheck,
} from '../transform-functions/abs-test';

const normalizedTransformCasesToCheck = transformCasesToCheck.map(({ input, output }) => ({
  input: {
    type: 'basic',
    data: input,
  },
  output: {
    type: 'basic',
    data: output,
  },
}));

const casesToCheck = [...normalizedTransformCasesToCheck, {
  input: {
    type: 'points',
    data: [point(1, -10), point(2, -20)],
  },
  output: {
    type: 'points',
    data: [point(1, 10), point(2, 20)],
  },
}, {
  input: {
    type: 'points',
    data: [point(1, 10), point(2, -20)],
  },
  output: {
    type: 'points',
    data: [point(1, 10), point(2, 20)],
  },
}, {
  input: {
    type: 'points',
    data: [point(1, 10), point(2, null)],
  },
  output: {
    type: 'points',
    data: [point(1, 10), point(2, null)],
  },
}, {
  input: {
    type: 'points',
    data: [point(1, {}), point(2, NaN)],
  },
  output: {
    type: 'points',
    data: [point(1, null), point(2, null)],
  },
}];

describe('Unit | Utility | one time series chart/series functions/abs', function () {
  casesToCheck.forEach(({ input, output }) => testAbs(input, output));
});

function testAbs(input, output) {
  const stringifiedInput = stringifyArgumentData(input.data);
  const stringifiedOutput = stringifyArgumentData(output.data);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}`, async function () {
    const context = createContext();
    const data = createConstArgument(input);

    expect(await abs(context, { data })).to.deep.equal(output);
    expectFunctionsEvaluation(context, [data]);
  });
}
