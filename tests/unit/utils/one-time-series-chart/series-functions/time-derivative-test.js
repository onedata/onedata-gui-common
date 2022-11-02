import { expect } from 'chai';
import { describe, it } from 'mocha';
import timeDerivative from 'onedata-gui-common/utils/one-time-series-chart/series-functions/time-derivative';
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
    data: [point(1, 100), point(2, 50), point(3, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -10), point(3, 20)],
  },
}, {
  // time span different than default
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50), point(3, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 5,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -50), point(3, 100)],
  },
}, {
  // null time span
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50), point(3, 150)],
  },
  timeSpan: null,
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -10), point(3, 20)],
  },
}, {
  // time span == 0
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50), point(3, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 0,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -10), point(3, 20)],
  },
}, {
  // time span < 0
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 50), point(3, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: -1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -10), point(3, 20)],
  },
}, {
  // points having null
  input: {
    type: 'points',
    data: [point(1, 100), point(2, null), point(3, null), point(4, 50), point(5, 100)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, null), point(3, null), point(4, null), point(5, 10)],
  },
}, {
  // points having 0 and negative values
  input: {
    type: 'points',
    data: [point(1, 100), point(2, 0), point(3, -150)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -20), point(3, -30)],
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
    data: [-10, null],
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
    data: null,
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
    data: [point(1, 100), point(2, 50), point(3, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 60,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -600), point(3, 1200)],
  },
}, {
  // time resolution much larger than time span
  input: {
    type: 'points',
    data: [point(1, 8640000), point(2, 2160000), point(3, 4320000)],
  },
  timeSpan: {
    type: 'basic',
    data: 30,
  },
  timeResolution: 60 * 60 * 24,
  output: {
    type: 'points',
    data: [point(2, -2250), point(3, 750)],
  },
}, {
  // the additional point is the oldest one
  input: {
    type: 'points',
    data: [point(1, 100, { oldest: true }), point(2, 50), point(3, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(2, -10), point(3, 20)],
  },
}, {
  // the additional point is a point before the oldest
  input: {
    type: 'points',
    data: [
      point(0, null, { oldest: true, fake: true }),
      point(1, 100, { oldest: true }),
      point(2, 50),
      point(3, 150),
    ],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(1, 20, { oldest: true }), point(2, -10), point(3, 20)],
  },
}, {
  // the additional point is a point far before the oldest
  input: {
    type: 'points',
    data: [
      point(-1, null, { oldest: true, fake: true }),
      point(0, null, { oldest: true, fake: true }),
      point(1, 100, { oldest: true }),
      point(2, 50),
      point(3, 150),
    ],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [
      point(0, null, { oldest: true, fake: true }),
      point(1, 20, { oldest: true }),
      point(2, -10),
      point(3, 20),
    ],
  },
}];

describe('Unit | Utility | one time series chart/series functions/time derivative',
  function () {
    casesToCheck.forEach(({ input, timeSpan, timeResolution, output }) =>
      testTimeDerivative(input, timeSpan, timeResolution, output)
    );
  }
);

function testTimeDerivative(input, timeSpan, timeResolution, output) {
  const stringifiedInput = stringifyArgumentData(input.data);
  const stringifiedTimeSpan = stringifyArgumentData(timeSpan?.data ?? null);
  const stringifiedOutput = stringifyArgumentData(output.data);

  it(`returns ${stringifiedOutput} for ${stringifiedInput}, time span ${stringifiedTimeSpan} and time resolution ${timeResolution}`,
    async function () {
      const context = createContext();
      context.timeResolution = timeResolution;
      const inputDataProvider = createConstArgument(input);
      const timeSpanProvider = createConstArgument(timeSpan);

      expect(await timeDerivative(context, { inputDataProvider, timeSpanProvider }))
        .to.deep.equal(output);
      expectFunctionsEvaluation(
        Object.assign({}, context, { pointsCount: context.pointsCount + 1 }),
        [inputDataProvider]
      );
      expectFunctionsEvaluation(context, [timeSpanProvider]);
    }
  );
}
