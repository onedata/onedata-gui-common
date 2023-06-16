import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  afterEach,
} from 'mocha';
import sinon from 'sinon';
import QueryBatcher from 'onedata-gui-common/utils/one-time-series-chart/query-batcher';
import { run } from '@ember/runloop';
import {
  all as allFulfilled,
  resolve,
  reject,
} from 'rsvp';
import { suppressRejections } from '../../../helpers/suppress-rejections';

const defaultBatchAccumulationTime = 5;

describe('Unit | Utility | one-time-series-chart/query-batcher', function () {
  beforeEach(function () {
    this.fetchData = sinon.stub()
      .callsFake(({ collectionRef, layout, startTimestamp, windowLimit }) => {
        let negativeValueOccurred = false;
        const result = Object.keys(layout).reduce((seriesAcc, seriesName) => {
          seriesAcc[seriesName] = layout[seriesName]
            .reduce((metricsAcc, metricName) => {
              const pointValue = pointValueFromMetricSpec({
                collectionRef,
                seriesName,
                metricName,
                startTimestamp,
                windowLimit,
              });
              metricsAcc[metricName] = [{
                timestamp: 1,
                value: pointValue,
              }];
              if (pointValue < 0) {
                negativeValueOccurred = true;
              }
              return metricsAcc;
            }, {});
          return seriesAcc;
        }, {});
        return negativeValueOccurred ? reject('err') : resolve(result);
      });
    this.fakeClock = sinon.useFakeTimers({
      now: Date.now(),
      shouldAdvanceTime: true,
    });
    this.batcher = new QueryBatcher({ fetchData: this.fetchData });
    this.batcher.batchAccumulationTime = defaultBatchAccumulationTime;
  });

  afterEach(function () {
    this.batcher.destroy();
    this.fakeClock.restore();
  });

  it('does not call fetchData when no queries were requested', function () {
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.not.called;
  });

  it('does not call fetchData after query but before accumulation timeout', function () {
    this.batcher.query(queryParams());
    tickBatchTimeout(this, 0.5);

    expect(this.fetchData).to.be.not.called;
  });

  it('calls fetchData once after query and after accumulation timeout', function () {
    this.batcher.query(queryParams());
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledOnce;
  });

  it('calls fetchData once after accumulation timeout for two similar queries', function () {
    this.batcher.query(queryParams());
    tickBatchTimeout(this, 0.5);
    this.batcher.query(queryParams());
    tickBatchTimeout(this, 0.6);

    expect(this.fetchData).to.be.calledOnce;
  });

  it('calls fetchData according to modified batchAccumulationTime', function () {
    this.batcher.batchAccumulationTime = 2 * defaultBatchAccumulationTime;
    this.batcher.query(queryParams());
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.not.called;

    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledOnce;
  });

  it('does not call fetchData after batcher destroy', function () {
    this.batcher.query(queryParams());
    this.batcher.destroy();
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.not.called;
  });

  it('calls fetchData after timeout, which starts according to the first query in batch', function () {
    this.batcher.query(queryParams());
    tickBatchTimeout(this);
    this.fetchData.resetHistory();
    tickBatchTimeout(this, 2.5);

    expect(this.fetchData).to.be.not.called;

    this.batcher.query(queryParams());
    tickBatchTimeout(this, 0.8);

    expect(this.fetchData).to.be.not.called;

    tickBatchTimeout(this, 0.4);

    expect(this.fetchData).to.be.calledOnce;
  });

  it('correctly executes batch of two the same queries', async function () {
    const promise1 = this.batcher.query(queryParams());
    const promise2 = this.batcher.query(queryParams());
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledOnce
      .and.to.be.calledWith(batchedQueryParams());
    expect(await promise1).to.deep.equal(queryResult());
    expect(await promise2).to.deep.equal(queryResult());
  });

  it('correctly executes batch of two queries, which have different startTimestamp', async function () {
    const diffQueryParams = queryParams({ startTimestamp: 123 });
    const promise1 = this.batcher.query(queryParams());
    const promise2 = this.batcher.query(diffQueryParams);
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledTwice
      .and.to.be.calledWith(batchedQueryParams())
      .and.to.be.calledWith(batchedQueryParams(diffQueryParams));
    expect(await promise1).to.deep.equal(queryResult());
    expect(await promise2).to.deep.equal(queryResult(diffQueryParams));
  });

  it('correctly executes batch of two queries, which have different limit', async function () {
    const diffQueryParams = queryParams({ windowLimit: 123 });
    const promise1 = this.batcher.query(queryParams());
    const promise2 = this.batcher.query(diffQueryParams);
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledTwice
      .and.to.be.calledWith(batchedQueryParams())
      .and.to.be.calledWith(batchedQueryParams(diffQueryParams));
    expect(await promise1).to.deep.equal(queryResult());
    expect(await promise2).to.deep.equal(queryResult(diffQueryParams));
  });

  it('correctly executes batch of two queries, which have different metricName', async function () {
    const diffQueryParams = queryParams({ metricName: 'metric_2' });
    const promise1 = this.batcher.query(queryParams());
    const promise2 = this.batcher.query(diffQueryParams);
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledOnce
      .and.to.be.calledWith(batchedQueryParams({
        layout: { series_1: ['metric_1', 'metric_2'] },
      }));
    expect(await promise1).to.deep.equal(queryResult());
    expect(await promise2).to.deep.equal(queryResult(diffQueryParams));
  });

  it('correctly executes batch of two queries, which have different seriesName', async function () {
    const diffQueryParams = queryParams({ seriesName: 'series_2' });
    const promise1 = this.batcher.query(queryParams());
    const promise2 = this.batcher.query(diffQueryParams);
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledOnce
      .and.to.be.calledWith(batchedQueryParams({
        layout: { series_1: ['metric_1'], series_2: ['metric_1'] },
      }));
    expect(await promise1).to.deep.equal(queryResult());
    expect(await promise2).to.deep.equal(queryResult(diffQueryParams));
  });

  it('correctly executes batch of two queries, which have different collectionRef', async function () {
    const queryParams1 = queryParams({ collectionRef: 'collection_1' });
    const queryParams2 = queryParams({ collectionRef: 'collection_2' });
    const promise1 = this.batcher.query(queryParams(queryParams1));
    const promise2 = this.batcher.query(queryParams2);
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledTwice
      .and.to.be.calledWith(batchedQueryParams(queryParams1))
      .and.to.be.calledWith(batchedQueryParams(queryParams2));
    expect(await promise1).to.deep.equal(queryResult(queryParams1));
    expect(await promise2).to.deep.equal(queryResult(queryParams2));
  });

  it('correctly executes batch of many diffrent queries', async function () {
    const queryParamsArray = [
      queryParams({ collectionRef: 'collection_1' }),
      queryParams({ collectionRef: 'collection_2' }),
      queryParams({
        collectionRef: 'collection_1',
        metricName: 'metric_2',
        windowLimit: 200,
      }),
      queryParams({
        collectionRef: 'collection_1',
        seriesName: 'series_2',
        windowLimit: 200,
      }),
      queryParams({
        collectionRef: 'collection_2',
        metricName: 'metric_3',
      }),
      queryParams({
        collectionRef: 'collection_2',
        metricName: 'metric_4',
        startTimestamp: 100,
      }),
      queryParams({
        collectionRef: 'collection_2',
        metricName: 'metric_5',
        startTimestamp: 100,
      }),
      queryParams({ collectionRef: 'collection_1' }),
    ];
    const promises = queryParamsArray.map(queryParams => this.batcher.query(queryParams));
    tickBatchTimeout(this);

    expect(this.fetchData).to.have.callCount(4)
      .and.to.be.calledWith(batchedQueryParams(queryParamsArray[0]))
      .and.to.be.calledWith(batchedQueryParams(Object.assign({
        layout: { series_1: ['metric_1', 'metric_3'] },
      }, queryParamsArray[1])))
      .and.to.be.calledWith(batchedQueryParams(Object.assign({
        layout: { series_1: ['metric_2'], series_2: ['metric_1'] },
      }, queryParamsArray[2])))
      .and.to.be.calledWith(batchedQueryParams(Object.assign({
        layout: { series_1: ['metric_4', 'metric_5'] },
      }, queryParamsArray[5])));
    const results = await allFulfilled(promises);
    results.forEach((result, idx) =>
      expect(result).to.deep.equal(queryResult(queryParamsArray[idx]))
    );
  });

  it('handles mixed resolved and rejected results of fetchData', async function () {
    suppressRejections();
    const queryParamsArray = [
      queryParams({ collectionRef: 'collection_1' }),
      queryParams({ collectionRef: 'collection_2' }),
      queryParams({ collectionRef: 'collection_1', metricName: 'metric_-1' }),
      queryParams({ collectionRef: 'collection_1', windowLimit: 123 }),
    ];
    const promises = queryParamsArray.map(queryParams => this.batcher.query(queryParams));
    tickBatchTimeout(this);

    let promise1Err;
    let promise3Err;
    try { await promises[0]; } catch (e) { promise1Err = e; }
    try { await promises[2]; } catch (e) { promise3Err = e; }
    expect(promise1Err).to.equal('err');
    expect(promise3Err).to.equal('err');
    expect(await promises[1]).to.deep.equal(queryResult(queryParamsArray[1]));
    expect(await promises[3]).to.deep.equal(queryResult(queryParamsArray[3]));
  });

  it('correctly executes two batches', async function () {
    const promise1 = this.batcher.query(queryParams());
    tickBatchTimeout(this);

    const queryParams2 = queryParams({ seriesName: 'series_2' });
    const promise2 = this.batcher.query(queryParams2);
    tickBatchTimeout(this);

    expect(this.fetchData).to.be.calledTwice
      .and.to.be.calledWith(batchedQueryParams())
      .and.to.be.calledWith(batchedQueryParams({
        layout: { series_2: ['metric_1'] },
      }));
    expect(await promise1).to.deep.equal(queryResult());
    expect(await promise2).to.deep.equal(queryResult(queryParams2));
  });
});

function queryParams({
  collectionRef = null,
  seriesName = 'series_1',
  metricName = 'metric_1',
  startTimestamp = null,
  windowLimit = 10,
} = {}) {
  return {
    collectionRef,
    seriesName,
    metricName,
    startTimestamp,
    windowLimit,
  };
}

function batchedQueryParams({
  collectionRef = null,
  layout = { series_1: ['metric_1'] },
  startTimestamp = null,
  windowLimit = 10,
} = {}) {
  return {
    collectionRef,
    layout,
    startTimestamp,
    windowLimit,
  };
}

function queryResult({
  collectionRef = null,
  seriesName = 'series_1',
  metricName = 'metric_1',
  startTimestamp = null,
  windowLimit = 10,
} = {}) {
  return [{
    timestamp: 1,
    value: pointValueFromMetricSpec({
      collectionRef,
      seriesName,
      metricName,
      startTimestamp,
      windowLimit,
    }),
  }];
}

function pointValueFromMetricSpec({
  collectionRef,
  seriesName,
  metricName,
  startTimestamp,
  windowLimit,
}) {
  const collectionIdx = collectionRef ? parseInt(collectionRef.split('_')[1]) : 0;
  const seriesIdx = parseInt(seriesName.split('_')[1]);
  const metricIdx = parseInt(metricName.split('_')[1]);
  if (
    startTimestamp < 0 ||
    windowLimit < 0 ||
    collectionIdx < 0 ||
    seriesIdx < 0 ||
    metricIdx < 0
  ) {
    return -1;
  }
  return (startTimestamp || 999999) +
    windowLimit +
    0.01 * collectionIdx +
    0.0001 * seriesIdx +
    0.000001 * metricIdx;
}

function tickBatchTimeout(testCase, timeoutsCount = 1.2) {
  // Added `run` to avoid Backburner error `end called without begin`, which happens
  // in some tests.
  run(() =>
    testCase.fakeClock.tick(defaultBatchAccumulationTime * timeoutsCount)
  );
}
