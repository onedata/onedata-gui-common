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
    data: [point(10, 100), point(15, 50), point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -10), point(20, 20)],
  },
}, {
  // time span different than default
  input: {
    type: 'points',
    data: [point(10, 100), point(15, 50), point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 5,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -50), point(20, 100)],
  },
}, {
  // null time span
  input: {
    type: 'points',
    data: [point(10, 100), point(15, 50), point(20, 150)],
  },
  timeSpan: null,
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -10), point(20, 20)],
  },
}, {
  // time span == 0
  input: {
    type: 'points',
    data: [point(10, 100), point(15, 50), point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 0,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -10), point(20, 20)],
  },
}, {
  // time span < 0
  input: {
    type: 'points',
    data: [point(10, 100), point(15, 50), point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: -1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -10), point(20, 20)],
  },
}, {
  // points having null
  input: {
    type: 'points',
    data: [
      point(10, 100),
      point(15, null),
      point(20, null),
      point(25, 50),
      point(30, 100),
    ],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, null), point(20, null), point(25, null), point(30, 10)],
  },
}, {
  // points having 0 and negative values
  input: {
    type: 'points',
    data: [point(10, 100), point(15, 0), point(20, -150)],
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -20), point(20, -30)],
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
    data: [point(10, 100), point(15, 50), point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 60,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -600), point(20, 1200)],
  },
}, {
  // time resolution much larger than time span
  input: {
    type: 'points',
    data: [point(10, 8640000), point(15, 2160000), point(20, 4320000)],
  },
  timeSpan: {
    type: 'basic',
    data: 30,
  },
  timeResolution: 60 * 60 * 24,
  output: {
    type: 'points',
    data: [point(15, -2250), point(20, 750)],
  },
}, {
  // the additional point is the oldest one
  input: {
    type: 'points',
    data: [point(10, 100, { oldest: true }), point(15, 50), point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(15, -10), point(20, 20)],
  },
}, {
  // the additional point is a point before the oldest
  input: {
    type: 'points',
    data: [
      point(5, null, { oldest: true, fake: true }),
      point(10, 100, { oldest: true }),
      point(15, 50),
      point(20, 150),
    ],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  output: {
    type: 'points',
    data: [point(10, 20, { oldest: true }), point(15, -10), point(20, 20)],
  },
}, {
  // the additional point is a point far before the oldest
  input: {
    type: 'points',
    data: [
      point(0, null, { oldest: true, fake: true }),
      point(5, null, { oldest: true, fake: true }),
      point(10, 100, { oldest: true }),
      point(15, 50),
      point(20, 150),
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
      point(5, null, { oldest: true, fake: true }),
      point(10, 20, { oldest: true }),
      point(15, -10),
      point(20, 20),
    ],
  },
}, {
  // partial last point
  input: {
    type: 'points',
    data: [point(10, 100), point(15, 50), point(20, 150)],
  },
  timeSpan: {
    type: 'basic',
    data: 1,
  },
  timeResolution: 5,
  newestEdgeTimestamp: 21,
  output: {
    type: 'points',
    data: [point(15, -10), point(20, 50)],
  },
}];

describe('Unit | Utility | one time series chart/series functions/time derivative',
  function () {
    casesToCheck.forEach((spec) => testTimeDerivative(spec));
  }
);

function testTimeDerivative({
  input,
  timeSpan,
  timeResolution,
  newestEdgeTimestamp,
  output,
}) {
  const stringifiedInput = stringifyArgumentData(input.data);
  const stringifiedTimeSpan = stringifyArgumentData(timeSpan?.data ?? null);
  const stringifiedOutput = stringifyArgumentData(output.data);
  const newestEdgeTimestampDescription = newestEdgeTimestamp ? `, newest edge timestamp ${newestEdgeTimestamp}` : '';

  it(`returns ${stringifiedOutput} for ${stringifiedInput}, time span ${stringifiedTimeSpan}${newestEdgeTimestampDescription} and time resolution ${timeResolution}`,
    async function () {
      const context = createContext();
      context.timeResolution = timeResolution;
      context.newestEdgeTimestamp = newestEdgeTimestamp ?? 99999999;
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
