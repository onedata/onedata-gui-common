import { expect } from 'chai';
import { describe, it, context, beforeEach, afterEach } from 'mocha';
import loadSeries from 'onedata-gui-common/utils/one-histogram/series-functions/load-series';
import { point, createContext } from './helpers';
import _ from 'lodash';
import sinon from 'sinon';

let fakeClock;

describe('Unit | Utility | one histogram/series functions/load series', function () {
  beforeEach(function () {
    this.context = createContext();
  });

  afterEach(function () {
    if (fakeClock) {
      fakeClock.restore();
    }
  });

  context('when "sourceType" is "empty"', function () {
    beforeEach(function () {
      this.functionArguments = {
        sourceType: 'empty',
      };
    });

    it('produces empty series', async function (done) {
      const normalizedLastWindowTimestamp =
        this.context.lastWindowTimestamp - this.context.lastWindowTimestamp % this.context.timeResolution;
      const expectedSeries = _.times(this.context.windowsCount, (idx) => point(
        normalizedLastWindowTimestamp - (this.context.windowsCount - idx - 1) *
        this.context.timeResolution,
        null,
      ));
      expect(await loadSeries(this.context, this.functionArguments))
        .to.deep.equal(expectedSeries);
      done();
    });

    it('produces empty series even when lastWindowTimestamp is not provided', async function (done) {
      this.context.lastWindowTimestamp = null;
      const expectedSeries = produceExpectedEmptySeries(this);

      expect(await loadSeries(this.context, this.functionArguments))
        .to.deep.equal(expectedSeries);
      done();
    });

    it('returns null when timeResolution is not provided', async function (done) {
      this.context.timeResolution = null;

      expect(await loadSeries(this.context, this.functionArguments)).to.be.null;
      done();
    });

    it('returns null when windowsCount is not provided', async function (done) {
      this.context.windowsCount = null;

      expect(await loadSeries(this.context, this.functionArguments)).to.be.null;
      done();
    });
  });

  context('when "sourceType" is "external"', function () {
    beforeEach(function () {
      this.customSourceData = [];
      this.context.externalDataSources = {
        customSource: {
          fetchData: sinon.spy(() => this.customSourceData),
        },
      };
      this.functionArguments = {
        sourceType: 'external',
        sourceParameters: {
          externalSourceName: 'customSource',
          externalSourceParameters: {
            a: 1,
          },
        },
      };
    });

    it('produces series acquired from custom source', async function (done) {
      this.customSourceData.push(point(this.context.lastWindowTimestamp, 2));
      const expectedPoints = [
        ...this.customSourceData,
        ..._.times(this.context.windowsCount - 1, (idx) =>
          point(this.context.lastWindowTimestamp - (idx + 1) * this.context.timeResolution, null)
        ),
      ].reverse();
      expect(await loadSeries(this.context, this.functionArguments))
        .to.deep.equal(expectedPoints);
      expect(this.context.externalDataSources.customSource.fetchData).to.be.calledOnce
        .and.to.be.calledWith(sinon.match({
          lastWindowTimestamp: this.context.lastWindowTimestamp,
          timeResolution: this.context.timeResolution,
          windowsCount: this.context.windowsCount,
        }, this.functionArguments.sourceParameters.externalSourceParameters));
      done();
    });

    it('produces empty series when custom source does not exist', async function (done) {
      delete this.context.externalDataSources.customSource;
      const expectedSeries = produceExpectedEmptySeries(this);

      expect(await loadSeries(this.context, this.functionArguments))
        .to.deep.equal(expectedSeries);
      done();
    });

    it('normalizes shuffled series with missing and incorrect points (lastWindowTimestamp is null)',
      async function (done) {
        this.customSourceData = [
          point(4, 4),
          point(2, 2),
          point(6, 6),
          point(9, 9),
          point(12, 12),
        ];
        const expectedSeries = [
          point(4, 4),
          point(6, 6),
          point(8, null),
          point(10, null),
          point(12, 12),
        ];
        this.context.lastWindowTimestamp = null;
        this.context.timeResolution = 2;
        this.context.windowsCount = 5;

        expect(await loadSeries(this.context, this.functionArguments))
          .to.deep.equal(expectedSeries);
        done();
      });

    it('normalizes shuffled series with missing and incorrect points (lastWindowTimestamp is set)',
      async function (done) {
        this.customSourceData = [
          point(4, 4),
          point(2, 2),
          point(5, 5),
          point(6, 6),
          point(10, 10),
          point(12, 12),
        ];
        const expectedSeries = [
          point(0, null),
          point(2, 2),
          point(4, 4),
          point(6, 6),
          point(8, null),
        ];
        this.context.lastWindowTimestamp = 9;
        this.context.timeResolution = 2;
        this.context.windowsCount = 5;

        expect(await loadSeries(this.context, this.functionArguments))
          .to.deep.equal(expectedSeries);
        done();
      });

    it('adds missing newest points', async function (done) {
      this.customSourceData = [
        point(4, 4),
        point(2, 2),
        point(5, 5),
        point(6, 6),
        point(10, 10),
        point(12, 12),
      ];
      const expectedSeries = [
        point(8, null),
        point(10, 10),
        point(12, 12),
        point(14, null),
        point(16, null),
      ];
      this.context.lastWindowTimestamp = 16;
      this.context.timeResolution = 2;
      this.context.windowsCount = 5;

      expect(await loadSeries(this.context, this.functionArguments))
        .to.deep.equal(expectedSeries);
      done();
    });
  });
});

function produceExpectedEmptySeries(testCase) {
  const fakeNow = testCase.context.lastWindowTimestamp || 1641916475;
  fakeClock = sinon.useFakeTimers({
    now: fakeNow * 1000,
    shouldAdvanceTime: false,
  });
  const expectedLastWindowTimestamp = fakeNow - fakeNow % testCase.context.timeResolution;
  return _.times(testCase.context.windowsCount, (idx) => point(
    expectedLastWindowTimestamp - (testCase.context.windowsCount - idx - 1) *
    testCase.context.timeResolution,
    null,
  ));
}
