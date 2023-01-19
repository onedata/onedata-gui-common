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
    data: [point(0, 100), point(5, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 20), point(5, 10)],
  },
}, {
  // time span different than default
  input: {
    type: 'points',
    data: [point(0, 100), point(5, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 5,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 100), point(5, 50)],
  },
}, {
  // null time span
  input: {
    type: 'points',
    data: [point(0, 100), point(5, 50)],
  },
  timeSpan: null,
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 20), point(5, 10)],
  },
}, {
  // time span == 0
  input: {
    type: 'points',
    data: [point(0, 100), point(5, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 0,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 20), point(5, 10)],
  },
}, {
  // time span < 0
  input: {
    type: 'points',
    data: [point(0, 100), point(5, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: -1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 20), point(5, 10)],
  },
}, {
  // points having null
  input: {
    type: 'points',
    data: [point(0, 100), point(5, null), point(10, 50)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 20), point(5, null), point(10, 10)],
  },
}, {
  // points having 0 and negative values
  input: {
    type: 'points',
    data: [point(0, 0), point(5, -50)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 0), point(5, -10)],
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
    data: [point(0, 100), point(5, 50)],
  },
  timeSpan: {
    type: 'basic',
    data: 60,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 1200), point(5, 600)],
  },
}, {
  // time resolution much larger than time span
  input: {
    type: 'points',
    data: [
      point(0, 8640000, { pointDuration: 86400 }),
      point(5, 2160000, { pointDuration: 86400 }),
    ],
  },
  timeSpan: {
    type: 'basic',
    data: 30,
  },
  timeResolution: 60 * 60 * 24,
  output: {
    type: 'points',
    data: [
      point(0, 3000, { pointDuration: 86400 }),
      point(5, 750, { pointDuration: 86400 }),
    ],
  },
}, {
  // partial last point
  input: {
    type: 'points',
    data: [point(0, 100), point(5, 50, { lastMeasurementTimestamp: 6, newest: true })],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(0, 20), point(5, 25, { lastMeasurementTimestamp: 6, newest: true })],
  },
}];

describe('Unit | Utility | one time series chart/series functions/rate',
  function () {
    casesToCheck.forEach((spec) => testRate(spec));
  }
);

function testRate({ input, timeSpan, timeResolution, output }) {
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
