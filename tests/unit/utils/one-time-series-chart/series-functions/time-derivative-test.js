import { expect } from 'chai';
import { describe, it } from 'mocha';
import timeDerivative from 'onedata-gui-common/utils/one-time-series-chart/series-functions/time-derivative';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';
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
    data: [new Point(10, 100), new Point(15, 50), new Point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -10), new Point(20, 20)],
  },
}, {
  // time span different than default
  input: {
    type: 'points',
    data: [new Point(10, 100), new Point(15, 50), new Point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 5,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -50), new Point(20, 100)],
  },
}, {
  // null time span
  input: {
    type: 'points',
    data: [new Point(10, 100), new Point(15, 50), new Point(20, 150)],
  },
  timeSpan: null,
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -10), new Point(20, 20)],
  },
}, {
  // time span == 0
  input: {
    type: 'points',
    data: [new Point(10, 100), new Point(15, 50), new Point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 0,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -10), new Point(20, 20)],
  },
}, {
  // time span < 0
  input: {
    type: 'points',
    data: [new Point(10, 100), new Point(15, 50), new Point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: -1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -10), new Point(20, 20)],
  },
}, {
  // points having null
  input: {
    type: 'points',
    data: [
      new Point(10, 100),
      new Point(15, null),
      new Point(20, null),
      new Point(25, 50),
      new Point(30, 100),
    ],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [
      new Point(15, null),
      new Point(20, null),
      new Point(25, null),
      new Point(30, 10),
    ],
  },
}, {
  // points having 0 and negative values
  input: {
    type: 'points',
    data: [new Point(10, 100), new Point(15, 0), new Point(20, -150)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -20), new Point(20, -30)],
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
    data: [new Point(10, 100), new Point(15, 50), new Point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 60,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -600), new Point(20, 1200)],
  },
}, {
  // time resolution much larger than time span
  input: {
    type: 'points',
    data: [
      new Point(10, 8640000, { pointDuration: 86400 }),
      new Point(15, 2160000, { pointDuration: 86400 }),
      new Point(20, 4320000, { pointDuration: 86400 }),
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
      new Point(15, -2250, { pointDuration: 86400 }),
      new Point(20, 750, { pointDuration: 86400 }),
    ],
  },
}, {
  // the additional point is the oldest one
  input: {
    type: 'points',
    data: [new Point(10, 100, { oldest: true }), new Point(15, 50), new Point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(15, -10), new Point(20, 20)],
  },
}, {
  // the additional point is a point before the oldest
  input: {
    type: 'points',
    data: [
      new Point(5, null, { oldest: true, fake: true }),
      new Point(10, 100, { oldest: true }),
      new Point(15, 50),
      new Point(20, 150),
    ],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [new Point(10, 20, { oldest: true }), new Point(15, -10), new Point(20, 20)],
  },
}, {
  // the additional point is a point far before the oldest
  input: {
    type: 'points',
    data: [
      new Point(0, null, { oldest: true, fake: true }),
      new Point(5, null, { oldest: true, fake: true }),
      new Point(10, 100, { oldest: true }),
      new Point(15, 50),
      new Point(20, 150),
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
      new Point(5, null, { oldest: true, fake: true }),
      new Point(10, 20, { oldest: true }),
      new Point(15, -10),
      new Point(20, 20),
    ],
  },
}, {
  // partial last point
  input: {
    type: 'points',
    data: [
      new Point(10, 100),
      new Point(15, 50),
      new Point(20, 150, { lastMeasurementTimestamp: 21, newest: true }),
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
      new Point(15, -10),
      new Point(20, 50, { lastMeasurementTimestamp: 21, newest: true }),
    ],
  },
}];

describe('Unit | Utility | one-time-series-chart/series-functions/time-derivative',
  function () {
    casesToCheck.forEach((spec) => testTimeDerivative(spec));
  }
);

function testTimeDerivative({
  input,
  timeSpan,
  timeResolution,
  output,
}) {
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
