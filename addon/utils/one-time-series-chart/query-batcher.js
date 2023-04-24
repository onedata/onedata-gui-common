// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * Allows to batch multiple time-series data queries into a (usually) smaller
 * number of requests. It is possible, because backend API allows to fetch
 * multiple metrics per request as long as `startTimestamp` and `windowLimit` are the
 * same and queries are related to the same time series collection.
 *
 * Queries are accumulated from some period of time (see `batchAccumulationTime`
 * property) into a batch. After that time batch is "flushed" - requests are
 * prepared and executed to get data needed by queries in that batch. In the same
 * time a new batch is created to accept new incoming queries.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { defer, all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import config from 'ember-get-config';

/**
 * @typedef {Object} TimeSeriesQuery
 * @property {string} [collectionRef] sometimes there is only one collection
 *   so there is no need to provide an ID
 * @property {string} seriesName
 * @property {string} metricName
 * @property {number|null} startTimestamp timestamp of the newest point
 *   in the series to fetch. Query result will contain points with
 *   timestamps <= startTimestamp
 * @property {number} windowLimit number of points to fetch
 */

/**
 * @typedef {Object} TimeSeriesQueryBatchEntry
 * @property {TimeSeriesQuery} queryParams
 * @property {rsvp.defer<Array<OTSCRawSeriesPoint>>} resultDefer
 */

/**
 * @typedef {Object} BatchedTimeSeriesQuery
 * @property {string|null} collectionRef
 * @property {Object<string, Array<string>>} layout object with series IDs as keys
 *   and arrays of metrics IDs as values
 * @property {number|null} startTimestamp
 * @property {number} windowLimit
 */

/**
 * @typedef {Object<string, Object<string, Array<OTSCRawSeriesPoint>>} BatchedTimeSeriesQueryResult
 *   is a nested map (seriesName -> (metricName -> array of points))
 */

/**
 * @typedef {(batchedQuery: BatchedTimeSeriesQuery) => Promise<BatchedTimeSeriesQueryResult>} QueryBatchFetchDataCallback
 */

/**
 * @typedef {Object} QueryBatcherInitOptions
 * @property {QueryBatchFetchDataCallback} fetchData
 */

export default class QueryBatcher {
  /**
   * @public
   * @param {QueryBatcherInitOptions} params
   */
  constructor({ fetchData }) {
    /**
     * @public
     * @type {QueryBatchFetchDataCallback}
     */
    this.fetchData = fetchData;

    /**
     * Queries batching time in milliseconds
     * @public
     * @type {number}
     */
    this.batchAccumulationTime = config.environment === 'test' ? 1 : 5;

    /**
     * @private
     * @type {QueryBatch}
     */
    this.currentBatch = null;

    /**
     * @private
     * @type {number|null}
     */
    this.flushBatchTimer = null;

    this.createNewBatch();
  }

  /**
   * @public
   * @returns {void}
   */
  destroy() {
    if (this.flushBatchTimer !== null) {
      clearTimeout(this.flushBatchTimer);
    }
  }

  /**
   * @public
   * @param {TimeSeriesQuery} queryParams
   * @returns {Promise<Array<OTSCRawSeriesPoint>>}
   */
  query(queryParams) {
    const newBatchEntry = {
      queryParams,
      resultDefer: defer(),
    };
    this.currentBatch.addEntry(newBatchEntry);

    if (this.flushBatchTimer === null) {
      this.flushBatchTimer = setTimeout(
        () => this.flushBatch(),
        this.batchAccumulationTime
      );
    }

    return newBatchEntry.resultDefer.promise;
  }

  /**
   * @private
   * @returns {void}
   */
  flushBatch() {
    const batchToFlush = this.currentBatch;
    this.createNewBatch();

    batchToFlush.flush(this.fetchData);
  }

  /**
   * @private
   */
  createNewBatch() {
    this.currentBatch = new QueryBatch();
    this.flushBatchTimer = null;
  }
}

/**
 * @typedef {Map<string, Set<TimeSeriesQueryBatchEntry>>} QueriesPerMetric
 *   keys of this map are metrics ids
 */

/**
 * @typedef {Map<string, QueriesPerMetric>} QueriesPerSeries
 *   keys of this map are series ids
 */

/**
 * @typedef {Object} MetricParamsQueries
 * @property {{ startTimestamp: number|null, windowLimit: number }} metricParams
 * @property {QueriesPerSeries} queriesPerSeries
 */

/**
 * @typedef {Map<string, MetricParamsQueries>} QueriesPerMetricParams
 *   keys of this map are stringified concatenations of `startTimestamp` and `windowLimit`
 */

/**
 * @typedef {Map<string, QueriesPerMetricParams>} QueriesPerCollection
 *   keys of this map are time series collections ids
 */

class QueryBatch {
  /**
   * @public
   */
  constructor() {
    /**
     * @private
     * @type {QueriesPerCollection}
     */
    this.queries = new Map();
  }

  /**
   * @public
   * @param {TimeSeriesQueryBatchEntry} batchEntry
   * @returns {void}
   */
  addEntry(queryBatchEntry) {
    const queryParams = queryBatchEntry.queryParams;
    const collectionRef = queryParams.collectionRef || null;
    if (!this.queries.has(collectionRef)) {
      this.queries.set(collectionRef, new Map());
    }
    const queriesPerMetricParams = this.queries.get(collectionRef);

    const metricParamsAsKey = `${queryParams.startTimestamp}#${queryParams.windowLimit}`;
    if (!queriesPerMetricParams.has(metricParamsAsKey)) {
      queriesPerMetricParams.set(metricParamsAsKey, {
        metricParams: {
          startTimestamp: queryParams.startTimestamp,
          windowLimit: queryParams.windowLimit,
        },
        queriesPerSeries: new Map(),
      });
    }
    const queriesPerSeries =
      queriesPerMetricParams.get(metricParamsAsKey).queriesPerSeries;

    const seriesName = queryParams.seriesName;
    if (!queriesPerSeries.has(seriesName)) {
      queriesPerSeries.set(seriesName, new Map());
    }
    const queriesPerMetric = queriesPerSeries.get(seriesName);

    const metricName = queryParams.metricName;
    if (!queriesPerMetric.has(metricName)) {
      queriesPerMetric.set(metricName, new Set());
    }
    const metricQueries = queriesPerMetric.get(metricName);

    metricQueries.add(queryBatchEntry);
  }

  /**
   * @public
   * @param {QueryBatchFetchDataCallback} fetchData
   * @returns {Promise<void>}
   */
  flush(fetchData) {
    const promises = [];
    for (const [collectionRef, queriesPerMetricParams] of this.queries) {
      for (const { metricParams, queriesPerSeries } of queriesPerMetricParams.values()) {
        promises.push(this.performFetchRequest(
          fetchData,
          collectionRef,
          metricParams,
          queriesPerSeries
        ));
      }
    }
    return allFulfilled(promises);
  }

  /**
   * @private
   * @param {QueryBatchFetchDataCallback} fetchData
   * @param {string|null} collectionRef
   * @param {{ startTimestamp: number|null, windowLimit: number}} metricParams
   * @param {QueriesPerSeries} queriesPerSeries
   * @returns {Promise<void>}
   */
  async performFetchRequest(
    fetchData,
    collectionRef, {
      startTimestamp,
      windowLimit,
    }, queriesPerSeries
  ) {
    const seriesToFetch = {};
    for (const [seriesName, queriesPerMetric] of queriesPerSeries) {
      seriesToFetch[seriesName] = [...queriesPerMetric.keys()];
    }
    let result;
    let resultIsError = false;
    try {
      result = await fetchData({
        collectionRef,
        layout: seriesToFetch,
        startTimestamp,
        windowLimit,
      });
    } catch (error) {
      result = error;
      resultIsError = true;
    }

    for (const [seriesName, queriesPerMetric] of queriesPerSeries) {
      for (const [metricName, metricQueries] of queriesPerMetric) {
        for (const queryBatchEntry of metricQueries) {
          if (resultIsError) {
            queryBatchEntry.resultDefer.reject(result);
          } else {
            const entryResult = _.get(result, `${seriesName}.${metricName}`, []);
            queryBatchEntry.resultDefer.resolve(entryResult);
          }
        }
      }
    }
  }
}
