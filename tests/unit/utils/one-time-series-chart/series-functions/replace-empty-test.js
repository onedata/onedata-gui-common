import { expect } from 'chai';
import { describe, it } from 'mocha';
import replaceEmpty from 'onedata-gui-common/utils/one-time-series-chart/series-functions/replace-empty';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';
import { createContext, expectFunctionsEvaluation, createConstArgument, stringifyArgumentData } from './helpers';
import { casesToCheck as transformCasesToCheck } from '../transform-functions/replace-empty-test';

const normalizedTransformCasesToCheck =
  transformCasesToCheck.map(({ data, fallbackValue, output }) => ({
    data: {
      type: 'basic',
      data,
    },
    fallbackValue: {
      type: 'basic',
      data: fallbackValue,
    },
    output: {
      type: 'basic',
      data: output,
    },
  }));

const casesToCheck = [...normalizedTransformCasesToCheck, {
  data: { type: 'points', data: [point(1, 2), point(3, 4)] },
  fallbackValue: { type: 'points', data: [point(1, 5), point(3, 6)] },
  output: { type: 'points', data: [point(1, 2), point(3, 4)] },
}, {
  data: { type: 'points', data: [point(1, null), point(3, 4)] },
  fallbackValue: { type: 'points', data: [point(1, 5), point(3, 6)] },
  output: { type: 'points', data: [point(1, 5), point(3, 4)] },
}, {
  data: { type: 'points', data: [point(1, null), point(3, null)] },
  fallbackValue: { type: 'points', data: [point(3, 6), point(4, 7)] },
  output: { type: 'points', data: [point(1, null), point(3, 6)] },
}, {
  data: { type: 'points', data: [point(1, 2), point(3, 4)] },
  fallbackValue: { type: 'basic', data: [2] },
  output: { type: 'basic', data: null },
}, {
  data: { type: 'points', data: [point(1, null), point(3, null)] },
  fallbackValue: { type: 'basic', data: [2, 3] },
  output: { type: 'points', data: [point(1, 2), point(3, 3)] },
}, {
  data: { type: 'basic', data: [null, null] },
  fallbackValue: { type: 'points', data: [point(3, 6), point(4, 7)] },
  output: { type: 'basic', data: [6, 7] },
}, {
  data: { type: 'basic', data: [1, 2] },
  fallbackValue: { type: 'points', data: [point(3, 6)] },
  output: { type: 'basic', data: null },
}, {
  data: { type: 'points', data: [point(1, 2), point(3, null)] },
  fallbackValue: { type: 'basic', data: 3 },
  output: { type: 'points', data: [point(1, 2), point(3, 3)] },
}];

describe('Unit | Utility | one time series chart/series functions/replace empty', function () {
  casesToCheck.forEach(({ data, fallbackValue, output }) =>
    testReplaceEmpty(data, fallbackValue, output)
  );
});

function testReplaceEmpty(data, fallbackValue, output) {
  const stringifiedData = stringifyArgumentData(data);
  const stringifiedFallbackValue = stringifyArgumentData(fallbackValue);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for data ${stringifiedData} and fallback value ${stringifiedFallbackValue}`,
    async function () {
      const context = createContext();
      const dataArg = createConstArgument(data);
      const fallbackValueArg = createConstArgument(fallbackValue);

      expect(await replaceEmpty(context, {
        data: dataArg,
        fallbackValue: fallbackValueArg,
      })).to.deep.equal(output);
      expectFunctionsEvaluation(context, [dataArg, fallbackValueArg]);
    });
}
