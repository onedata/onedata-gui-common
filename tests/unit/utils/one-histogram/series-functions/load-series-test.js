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
        this.context.lastWindowTimestamp - this.context.lastWindowTimestamp % this.context.windowTimeSpan;
      const expectedSeries = _.times(this.context.windowsCount, (idx) => point(
        normalizedLastWindowTimestamp - (this.context.windowsCount - idx - 1) *
        this.context.windowTimeSpan,
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

    it('returns null when windowTimeSpan is not provided', async function (done) {
      this.context.windowTimeSpan = null;

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
      this.customSourceData = [point(1, 2)];
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
      expect(await loadSeries(this.context, this.functionArguments))
        .to.deep.equal(this.customSourceData);
      expect(this.context.externalDataSources.customSource.fetchData).to.be.calledOnce
        .and.to.be.calledWith(sinon.match({
          lastWindowTimestamp: this.context.lastWindowTimestamp,
          windowTimeSpan: this.context.windowTimeSpan,
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
  });
});

function produceExpectedEmptySeries(testCase) {
  const fakeNow = testCase.context.lastWindowTimestamp || 1641916475;
  fakeClock = sinon.useFakeTimers({
    now: fakeNow * 1000,
    shouldAdvanceTime: false,
  });
  const expectedLastWindowTimestamp = fakeNow - fakeNow % testCase.context.windowTimeSpan;
  return _.times(testCase.context.windowsCount, (idx) => point(
    expectedLastWindowTimestamp - (testCase.context.windowsCount - idx - 1) *
    testCase.context.windowTimeSpan,
    null,
  ));
}
