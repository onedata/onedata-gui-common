// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable max-len */

import { expect } from 'chai';
import {
  describe,
  it,
  context,
  beforeEach,
  afterEach,
} from 'mocha';
import loadSeries from 'onedata-gui-common/utils/one-time-series-chart/series-functions/load-series';
import Point from 'onedata-gui-common/utils/one-time-series-chart/point';
import { createContext } from './helpers';
import sinon from 'sinon';

const point = (timestamp, value, options) =>
  new Point(timestamp, value, { pointDuration: 2, ...(options || {}) });
let fakeClock;

describe('Unit | Utility | one-time-series-chart/series-functions/load-series', function () {
  beforeEach(function () {
    this.context = createContext();
    this.context.lastPointTimestamp = 20;
    this.context.newestPointTimestamp = 22;
    this.context.timeResolution = 2;
    this.context.pointsCount = 5;
  });

  afterEach(function () {
    if (fakeClock) {
      fakeClock.restore();
    }
  });

  context('when "sourceType" is "external"', function () {
    beforeEach(function () {
      this.customSourceData = [];
      this.context.externalDataSources = {
        customSource: {
          fetchSeries: sinon.spy(() => this.customSourceData),
        },
      };
      this.functionArguments = {
        sourceType: 'external',
        sourceSpecProvider: {
          functionName: 'literal',
          functionArguments: {
            data: {
              externalSourceName: 'customSource',
              externalSourceParameters: {
                someParameter: 1,
              },
            },
          },
        },
      };
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (no points)',
      sourceData: [],
      expectedPoints: [
        point(12, null, { fake: true, oldest: true }),
        point(14, null, { fake: true, oldest: true }),
        point(16, null, { fake: true, oldest: true }),
        point(18, null, { fake: true, oldest: true }),
        point(20, null, { fake: true, oldest: true }),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (middle of large series)',
      sourceData: [
        rawPoint(10, -2),
        rawPoint(12, -1),
        rawPoint(14, 0),
        rawPoint(16, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, -1),
        point(14, 0),
        point(16, 1),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (oldest point in the middle)',
      sourceData: [
        rawPoint(16, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, null, { oldest: true, fake: true }),
        point(14, null, { oldest: true, fake: true }),
        point(16, 1, { oldest: true }),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (all points are too old)',
      sourceData: [
        rawPoint(0, -4),
        rawPoint(2, -3),
        rawPoint(4, -2),
        rawPoint(6, -1),
        rawPoint(8, 0),
        rawPoint(10, 1),
      ],
      expectedPoints: [
        point(12, null, { fake: true }),
        point(14, null, { fake: true }),
        point(16, null, { fake: true }),
        point(18, null, { fake: true }),
        point(20, null, { fake: true }),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (oldest point is badly time-aligned and at the end)',
      sourceData: [
        rawPoint(13, -1),
        rawPoint(16, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, null, { oldest: true, fake: true }),
        point(14, null, { fake: true }),
        point(16, 1),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (newest points missing)',
      sourceData: [
        rawPoint(4, -2),
        rawPoint(6, -1),
        rawPoint(8, 0),
        rawPoint(10, 1),
        rawPoint(12, 2),
        rawPoint(14, 3),
      ],
      expectedPoints: [
        point(12, 2),
        point(14, 3),
        point(16, null, { fake: true }),
        point(18, null, { fake: true }),
        point(20, null, { fake: true }),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (points missing in the middle)',
      sourceData: [
        rawPoint(6, -1),
        rawPoint(8, 0),
        rawPoint(10, 2),
        rawPoint(12, 3),
        rawPoint(18, 4),
        rawPoint(20, 5),
      ],
      expectedPoints: [
        point(12, 3),
        point(14, null, { fake: true }),
        point(16, null, { fake: true }),
        point(18, 4),
        point(20, 5),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (one point is newer than timestamp)',
      sourceData: [
        rawPoint(12, 1),
        rawPoint(14, 2),
        rawPoint(16, 3),
        rawPoint(18, 4),
        rawPoint(20, 5),
        rawPoint(22, 6),
      ],
      expectedPoints: [
        point(12, 1, { oldest: true }),
        point(14, 2),
        point(16, 3),
        point(18, 4),
        point(20, 5),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (two points are newer than timestamp)',
      sourceData: [
        rawPoint(14, 2),
        rawPoint(16, 3),
        rawPoint(18, 4),
        rawPoint(20, 5),
        rawPoint(22, 6),
        rawPoint(24, 7),
      ],
      expectedPoints: [
        point(12, null, { oldest: true, fake: true }),
        point(14, 2, { oldest: true }),
        point(16, 3),
        point(18, 4),
        point(20, 5),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (all points are newer than timestamp)',
      sourceData: [
        rawPoint(22, 6),
        rawPoint(24, 7),
        rawPoint(26, 8),
        rawPoint(28, 9),
        rawPoint(29, 10),
        rawPoint(30, 11),
      ],
      expectedPoints: [
        point(12, null, { oldest: true, fake: true }),
        point(14, null, { oldest: true, fake: true }),
        point(16, null, { oldest: true, fake: true }),
        point(18, null, { oldest: true, fake: true }),
        point(20, null, { oldest: true, fake: true }),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (shuffled points)',
      sourceData: [
        rawPoint(12, -1),
        rawPoint(18, 2),
        rawPoint(14, 0),
        rawPoint(10, -2),
        rawPoint(20, 3),
        rawPoint(16, 1),
      ],
      expectedPoints: [
        point(12, -1),
        point(14, 0),
        point(16, 1),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (badly time-aligned middle points)',
      sourceData: [
        rawPoint(10, -2),
        rawPoint(12, -1),
        rawPoint(15, 0),
        rawPoint(17, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, -1),
        point(14, null, { fake: true }),
        point(16, null, { fake: true }),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (badly time-aligned middle points, newest timestamp different than target lastPointTimestamp)',
      sourceData: [
        rawPoint(10, -2),
        rawPoint(11, -1),
        rawPoint(14, 0),
        rawPoint(16, 1),
        rawPoint(17, 2),
        rawPoint(18, 3),
      ],
      expectedPoints: [
        point(12, null, { fake: true }),
        point(14, 0),
        point(16, 1),
        point(18, 3),
        point(20, null, { fake: true }),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (null lastPointTimestamp)',
      lastPointTimestamp: null,
      sourceData: [
        rawPoint(10, -2),
        rawPoint(12, -1),
        rawPoint(14, 0),
        rawPoint(16, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, -1),
        point(14, 0),
        point(16, 1),
        point(18, 2),
        point(20, 3, { newest: true }),
      ],
    });

    testFetchSeriesScenario({
      title: 'produces empty series from custom source (null lastPointTimestamp, no points)',
      lastPointTimestamp: null,
      sourceData: [],
      expectedPoints: [],
    });

    testFetchSeriesScenario({
      title: 'produces series acquired from custom source (lastPointTimestamp == newestPointTimestamp)',
      lastPointTimestamp: 22,
      sourceData: [
        rawPoint(10, -2),
        rawPoint(12, -1),
        rawPoint(14, 0),
        rawPoint(16, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(14, 0),
        point(16, 1),
        point(18, 2),
        point(20, 3, { newest: true }),
        point(22, null, { newest: true, fake: true }),
      ],
    });

    it('produces empty series when custom source does not exist', async function (done) {
      delete this.context.externalDataSources.customSource;

      expect(await loadSeries(this.context, this.functionArguments)).to.deep.equal({
        type: 'points',
        data: [],
      });
      done();
    });

    it('returns empty series when timeResolution is not provided', async function (done) {
      this.context.timeResolution = null;

      expect(await loadSeries(this.context, this.functionArguments)).to.deep.equal({
        type: 'points',
        data: [],
      });
      done();
    });

    it('returns empty series when pointsCount is not provided', async function (done) {
      this.context.pointsCount = null;

      expect(await loadSeries(this.context, this.functionArguments)).to.deep.equal({
        type: 'points',
        data: [],
      });
      done();
    });

    testFetchSeriesScenario({
      title: 'allows to replace empty series points with specified fallback value',
      replaceEmptyParametersProvider: {
        strategyProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 'useFallback',
          },
        },
        fallbackValueProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 100,
          },
        },
      },
      sourceData: [
        rawPoint(10, -2),
        rawPoint(12, -1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, -1),
        point(14, 100, { fake: true }),
        point(16, 100, { fake: true }),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'allows to replace empty series points with previous point value',
      replaceEmptyParametersProvider: {
        strategyProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 'usePrevious',
          },
        },
        fallbackValueProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 100,
          },
        },
      },
      sourceData: [
        rawPoint(10, -2),
        rawPoint(12, -1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, -1),
        point(14, -1, { fake: true }),
        point(16, -1, { fake: true }),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'allows to replace empty series points with previous point value when previous point is outside context',
      replaceEmptyParametersProvider: {
        strategyProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 'usePrevious',
          },
        },
        fallbackValueProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 100,
          },
        },
      },
      sourceData: [
        rawPoint(2, -2),
        rawPoint(16, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, -2, { fake: true }),
        point(14, -2, { fake: true }),
        point(16, 1),
        point(18, 2),
        point(20, 3),
      ],
    });

    testFetchSeriesScenario({
      title: 'allows to replace empty series points with previous point value when previous point does not exist',
      replaceEmptyParametersProvider: {
        strategyProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 'usePrevious',
          },
        },
        fallbackValueProvider: {
          functionName: 'literal',
          functionArguments: {
            data: 100,
          },
        },
      },
      sourceData: [
        rawPoint(16, 1),
        rawPoint(18, 2),
        rawPoint(20, 3),
      ],
      expectedPoints: [
        point(12, 100, { fake: true, oldest: true }),
        point(14, 100, { fake: true, oldest: true }),
        point(16, 1, { oldest: true }),
        point(18, 2),
        point(20, 3),
      ],
    });
  });
});

function testFetchSeriesScenario({
  title,
  lastPointTimestamp,
  replaceEmptyParametersProvider,
  sourceData,
  expectedPoints,
}) {
  it(title, async function () {
    this.customSourceData = sourceData;
    if (lastPointTimestamp !== undefined) {
      this.context.lastPointTimestamp = lastPointTimestamp;
    }
    if (replaceEmptyParametersProvider) {
      this.functionArguments.replaceEmptyParametersProvider =
        replaceEmptyParametersProvider;
    }

    expect(await loadSeries(this.context, this.functionArguments)).to.deep.equal({
      type: 'points',
      data: expectedPoints,
    });
    expectFetchSeriesToBeCalled(this);
  });
}

function expectFetchSeriesToBeCalled(testCase) {
  expect(testCase.context.externalDataSources.customSource.fetchSeries).to.be.calledOnce
    .and.to.be.calledWith(
      sinon.match({
        lastPointTimestamp: testCase.context.lastPointTimestamp,
        timeResolution: testCase.context.timeResolution,
        pointsCount: testCase.context.pointsCount + 1,
      }),
      testCase.functionArguments.sourceSpecProvider.functionArguments.data
      .externalSourceParameters
    );
}

function rawPoint(timestamp, value) {
  return { timestamp, value };
}
