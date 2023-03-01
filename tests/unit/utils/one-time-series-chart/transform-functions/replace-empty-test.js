import { expect } from 'chai';
import { describe, it } from 'mocha';
import replaceEmpty from 'onedata-gui-common/utils/one-time-series-chart/transform-functions/replace-empty';
import {
  createContext,
  createConstArgument,
  expectFunctionsEvaluation,
  stringifyArgumentData,
} from './helpers';

const notReplaceableValues = [0, 'any', {}, false, NaN];

export const casesToCheck = [...notReplaceableValues.map(value => ({
  data: value,
  strategy: 'useFallback',
  fallbackValue: 1,
  output: value,
})), ...notReplaceableValues.map(value => ({
  data: value,
  strategy: 'usePrevious',
  fallbackValue: 1,
  output: value,
})), {
  data: null,
  strategy: 'useFallback',
  fallbackValue: 1,
  output: 1,
}, {
  data: null,
  strategy: 'usePrevious',
  fallbackValue: 1,
  output: 1,
}, {
  data: null,
  strategy: 'useFallback',
  fallbackValue: null,
  output: null,
}, {
  data: null,
  strategy: 'usePrevious',
  fallbackValue: null,
  output: null,
}, {
  data: [10, 'any'],
  strategy: 'useFallback',
  fallbackValue: 1,
  output: [10, 'any'],
}, {
  data: [10, 'any'],
  strategy: 'usePrevious',
  fallbackValue: 1,
  output: [10, 'any'],
}, {
  data: [null, 10, null, 'any'],
  strategy: 'useFallback',
  fallbackValue: 1,
  output: [1, 10, 1, 'any'],
}, {
  data: [null, 10, null, 'any'],
  strategy: 'usePrevious',
  fallbackValue: 1,
  output: [1, 10, 10, 'any'],
}, {
  data: [null, null],
  strategy: 'useFallback',
  fallbackValue: 1,
  output: [1, 1],
}, {
  data: [null, null],
  strategy: 'usePrevious',
  fallbackValue: 1,
  output: [1, 1],
}, {
  data: [],
  strategy: 'useFallback',
  fallbackValue: 1,
  output: [],
}, {
  data: [],
  strategy: 'usePrevious',
  fallbackValue: 1,
  output: [],
}, {
  data: [1, 2],
  strategy: 'useFallback',
  fallbackValue: [3],
  output: null,
}, {
  data: [1, 2],
  strategy: 'usePrevious',
  fallbackValue: [3],
  output: null,
}, {
  data: [1, 2],
  strategy: 'useFallback',
  fallbackValue: [3, 4],
  output: [1, 2],
}, {
  data: [1, 2],
  strategy: 'usePrevious',
  fallbackValue: [3, 4],
  output: [1, 2],
}, {
  data: [null, 1, null, 2],
  strategy: 'useFallback',
  fallbackValue: [3, 4, 5, 6],
  output: [3, 1, 5, 2],
}, {
  data: [null, 1, null, 2],
  strategy: 'usePrevious',
  fallbackValue: [3, 4, 5, 6],
  output: [3, 1, 1, 2],
}, {
  data: [],
  strategy: 'useFallback',
  fallbackValue: [],
  output: [],
}, {
  data: [],
  strategy: 'usePrevious',
  fallbackValue: [],
  output: [],
}, {
  data: [1, null, 2, null, null],
  strategy: 'useFallback',
  fallbackValue: [null, null, null, null, null],
  output: [1, null, 2, null, null],
}, {
  data: [1, null, 2, null, null],
  strategy: 'usePrevious',
  fallbackValue: [null, null, null, null, null],
  output: [1, 1, 2, 2, 2],
}];

describe('Unit | Utility | one-time-series-chart/transform-functions/replace-empty', function () {
  casesToCheck.forEach(({ data, strategy, fallbackValue, output }) =>
    testReplaceEmpty(data, strategy, fallbackValue, output)
  );
});

function testReplaceEmpty(data, strategy, fallbackValue, output) {
  const stringifiedData = stringifyArgumentData(data);
  const stringifiedStrategy = stringifyArgumentData(strategy);
  const stringifiedFallbackValue = stringifyArgumentData(fallbackValue);
  const stringifiedOutput = stringifyArgumentData(output);

  it(`returns ${stringifiedOutput} for data ${stringifiedData}, strategy "${stringifiedStrategy}" and fallback value ${stringifiedFallbackValue}`,
    function () {
      const context = createContext();
      const inputDataProvider = createConstArgument(data);
      const strategyProvider = createConstArgument(strategy);
      const fallbackValueProvider = createConstArgument(fallbackValue);

      expect(replaceEmpty(context, {
        inputDataProvider,
        strategyProvider,
        fallbackValueProvider,
      })).to.deep.equal(output);
      expectFunctionsEvaluation(context, [
        inputDataProvider,
        strategyProvider,
        fallbackValueProvider,
      ]);
    });
}
