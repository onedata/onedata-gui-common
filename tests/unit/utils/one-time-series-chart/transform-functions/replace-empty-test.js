import { expect } from 'chai';
import { describe, it } from 'mocha';
import replaceEmpty from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/replace-empty';
import {
  createContext,
  createConstArgument,
  expectFunctionsEvaluation,
  stringifyArgumentData,
} from './helpers';

export const casesToCheck = [...[0, 'any', {}, false, NaN].map(value => ({
  data: value,
  fallbackValue: 1,
  output: value,
})), {
  data: null,
  fallbackValue: 1,
  output: 1,
}, {
  data: null,
  fallbackValue: null,
  output: null,
}, {
  data: [10, 'any'],
  fallbackValue: 1,
  output: [10, 'any'],
}, {
  data: [null, 10, null, 'any'],
  fallbackValue: 1,
  output: [1, 10, 1, 'any'],
}, {
  data: [null, null],
  fallbackValue: 1,
  output: [1, 1],
}, {
  data: [],
  fallbackValue: 1,
  output: [],
}, {
  data: [1, 2],
  fallbackValue: [3],
  output: null,
}, {
  data: [1, 2],
  fallbackValue: [3, 4],
  output: [1, 2],
}, {
  data: [null, 1, null, 2],
  fallbackValue: [3, 4, 5, 6],
  output: [3, 1, 5, 2],
}, {
  data: [],
  fallbackValue: [],
  output: [],
}, {
  data: [1, null, 2, null],
  fallbackValue: [null, null, null, null],
  output: [1, null, 2, null],
}];

describe('Unit | Utility | one time series chart/transform functions/replace empty', function () {
  casesToCheck.forEach(({ data, fallbackValue, output }) =>
    testReplaceEmpty(data, fallbackValue, output)
  );
});

function testReplaceEmpty(data, fallbackValue, output) {
  const stringifiedData = stringifyArgumentData(data);
  const stringifiedFallbackValue = stringifyArgumentData(fallbackValue);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for data ${stringifiedData} and fallback value ${stringifiedFallbackValue}`,
    function () {
      const context = createContext();
      const dataArg = createConstArgument(data);
      const fallbackValueArg = createConstArgument(fallbackValue);

      expect(replaceEmpty(context, {
        data: dataArg,
        fallbackValue: fallbackValueArg,
      })).to.deep.equal(output);
      expectFunctionsEvaluation(context, [dataArg, fallbackValueArg]);
    });
}
