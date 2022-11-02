import { expect } from 'chai';
import { describe, it } from 'mocha';
import rate from 'onedata-gui-common/utils/one-time-series-chart/series-functions/rate';
import point from 'onedata-gui-common/utils/one-time-series-chart/series-functions/utils/point';
import {
  createContext,
  createConstArgument,
  expectFunctionsEvaluation,
  stringifyArgumentData,
} from './helpers';

const casesToCheck = [{
  // typical case
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 20), point(2, 10)],
  },
}, {
  // time span different than default
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 5,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 100), point(2, 50)],
  },
}, {
  // null time span
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50)],
  },
  timeSpan: null,
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 20), point(2, 10)],
  },
}, {
  // time span == 0
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 0,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 20), point(2, 10)],
  },
}, {
  // time span < 0
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: -1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 20), point(2, 10)],
  },
}, {
  // points having null
  input: {
    type: 'points',
    data: [point(1, 100), point(2, null), point(3, 50)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 20), point(2, null), point(3, 10)],
  },
}, {
  // points having 0 and negative values
  input: {
    type: 'points',
    data: [point(1, 0), point(2, -50)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 0), point(2, -10)],
  },
}, {
  // values array instead of points
  input: {
    type: 'basic',
    data: [100, 50, null],
  },
  timeResolution: 5,
  output: {
    type: 'basic',
    data: [20, 10, null],
  },
}, {
  // single value instead of points
  input: {
    type: 'basic',
    data: 100,
  },
  timeResolution: 5,
  output: {
    type: 'basic',
    data: 20,
  },
}, {
  // null instead of points
  input: {
    type: 'basic',
    data: null,
  },
  timeResolution: 5,
  output: {
    type: 'basic',
    data: null,
  },
}, {
  // time span larger than time resolution
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 60,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 1200), point(2, 600)],
  },
}, {
  // time resolution much larger than time span
  input: {
    type: 'points',
    data: [point(1, 8640000), point(2, 2160000)],
  },
  timeSpan: {
    type: 'basic',
    data: 30,
  },
  timeResolution: 60 * 60 * 24,
  output: {
    type: 'points',
    data: [point(1, 3000), point(2, 750)],
  },
}];

describe('Unit | Utility | one time series chart/series functions/rate',
  function () {
    casesToCheck.forEach(({ input, timeSpan, timeResolution, output }) =>
      testRate(input, timeSpan, timeResolution, output)
    );
  }
);

function testRate(input, timeSpan, timeResolution, output) {
  const stringifiedInput = stringifyArgumentData(input.data);
  const stringifiedTimeSpan = stringifyArgumentData(timeSpan?.data ?? null);
  const stringifiedOutput = stringifyArgumentData(output.data);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}, time span ${stringifiedTimeSpan} and time resolution ${timeResolution}`,
    async function () {
      const context = createContext();
      context.timeResolution = timeResolution;
      const inputDataProvider = createConstArgument(input);
      const timeSpanProvider = createConstArgument(timeSpan);

      expect(await rate(context, { inputDataProvider, timeSpanProvider }))
        .to.deep.equal(output);
      expectFunctionsEvaluation(context, [inputDataProvider, timeSpanProvider]);
    }
  );
}
