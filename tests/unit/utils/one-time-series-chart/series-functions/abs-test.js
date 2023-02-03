// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import abs from 'onedata-gui-common/utils/one-time-series-chart/series-functions/abs';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';
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
    data: [new Point(1, -10), new Point(2, -20)],
  },
  output: {
    type: 'points',
    data: [new Point(1, 10), new Point(2, 20)],
  },
}, {
  input: {
    type: 'points',
    data: [new Point(1, 10), new Point(2, -20)],
  },
  output: {
    type: 'points',
    data: [new Point(1, 10), new Point(2, 20)],
  },
}, {
  input: {
    type: 'points',
    data: [new Point(1, 10), new Point(2, null)],
  },
  output: {
    type: 'points',
    data: [new Point(1, 10), new Point(2, null)],
  },
}, {
  input: {
    type: 'points',
    data: [new Point(1, {}), new Point(2, NaN)],
  },
  output: {
    type: 'points',
    data: [new Point(1, null), new Point(2, null)],
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
    const inputDataProvider = createConstArgument(input);

    expect(await abs(context, { inputDataProvider })).to.deep.equal(output);
    expectFunctionsEvaluation(context, [inputDataProvider]);
  });
}
