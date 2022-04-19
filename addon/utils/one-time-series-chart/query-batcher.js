// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable jsdoc/require-returns */

/**
 * Allows to batch multiple time-series data queries into a (usually) smaller
 * number of requests. It is possible, because backend API allows to fetch
 * multiple metrics per request as long as `startTimestamp` and `limit` are the
 * same and queries are related to the same time series collection.
 *
 * Queries are accumulated from some period of time (see `batchAccumulationTime`
 * property) into a batch. After that time batch is "flushed" - requests are
 * prepared and executed to get data needed by queries in that batch. In the same
 * time a new batch is created to accept new incoming queries.
 *
 * @module utils/one-time-series-chart/query-batcher
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { defer, all as allFulfilled } from 'rsvp';
import _ from 'lodash';

/**
 * @typedef {Object} TimeSeriesQuery
 * @property {string} [collectionId] sometimes there is only one collection
 *   so there is no need to provide an ID
 * @property {string} seriesId
 * @property {string} metricId
 * @property {number|null} startTimestamp timestamp of the newest point
 *   in the series to fetch. Query result will contain points with
 *   timestamps <= startTimestamp
 * @property {number} limit number of points to fetch
 */

/**
 * @typedef {Object} TimeSeriesQueryBatchEntry
 * @property {TimeSeriesQuery} queryParams
 * @property {rsvp.defer<Array<OTSCRawSeriesPoint>>} resultDefer
 */

/**
 * @typedef {Object} BatchedTimeSeriesQuery
 * @property {string|null} collectionId
 * @property {Object<string, Array<string>>} metrics object with series IDs as keys
 *   and arrays of metrics IDs as values
 * @property {number|null} startTimestamp
 * @property {number} limit
 */

/**
 * @typedef {Object<string, Object<string, Array<OTSCRawSeriesPoint>>} BatchedTimeSeriesQueryResult
 *   is a nested map (seriesId -> (metricId -> array of points))
 */

/**
 * @typedef {(batchedQuery: BatchedTimeSeriesQuery) => Promise<BatchedTimeSeriesQueryResult>} QueryBatchFetchDataCallback
 */

/**
 * @typedef {Object} QueryBatcherInitOptions
 * @property {QueryBatchFetchDataCallback} fetchData
 * @property {(func: () => unknown, timeout: number) => unknown} [setTimeout]
 * @property {(setTimeoutTimer: unknown) => void} [clearTimeout]
 */

export default class QueryBatcher {
  /**
   * @public
   * @param {QueryBatcherInitOptions} params
   */
  constructor({
    fetchData,
    setTimeout = window.setTimeout.bind(window),
    clearTimeout = window.clearTimeout.bind(window),
  }) {
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
    this.batchAccumulationTime = 5;

    /**
     * @private
     * @type {(func: () => unknown, timeout: number) => unknown}
     */
    this.setTimeout = setTimeout;

    /**
     * @private
     * @type {(setTimeoutTimer: unknown) => void}
     */
    this.clearTimeout = clearTimeout;

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
      this.clearTimeout(this.flushBatchTimer);
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
      this.flushBatchTimer = this.setTimeout(
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
 * @property {{ startTimestamp: number|null, limit: number }} metricParams
 * @property {QueriesPerSeries} queriesPerSeries
 */

/**
 * @typedef {Map<string, MetricParamsQueries>} QueriesPerMetricParams
 *   keys of this map are stringified concatenations of `startTimestamp` and `limit`
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
    const collectionId = queryParams.collectionId || null;
    if (!this.queries.has(collectionId)) {
      this.queries.set(collectionId, new Map());
    }
    const queriesPerMetricParams = this.queries.get(collectionId);

    const metricParamsAsKey = `${queryParams.startTimestamp}#${queryParams.limit}`;
    if (!queriesPerMetricParams.has(metricParamsAsKey)) {
      queriesPerMetricParams.set(metricParamsAsKey, {
        metricParams: {
          startTimestamp: queryParams.startTimestamp,
          limit: queryParams.limit,
        },
        queriesPerSeries: new Map(),
      });
    }
    const queriesPerSeries =
      queriesPerMetricParams.get(metricParamsAsKey).queriesPerSeries;

    const seriesId = queryParams.seriesId;
    if (!queriesPerSeries.has(seriesId)) {
      queriesPerSeries.set(seriesId, new Map());
    }
    const queriesPerMetric = queriesPerSeries.get(seriesId);

    const metricId = queryParams.metricId;
    if (!queriesPerMetric.has(metricId)) {
      queriesPerMetric.set(metricId, new Set());
    }
    const metricQueries = queriesPerMetric.get(metricId);

    metricQueries.add(queryBatchEntry);
  }

  /**
   * @public
   * @param {QueryBatchFetchDataCallback} fetchData
   * @returns {Promise<void>}
   */
  flush(fetchData) {
    const promises = [];
    for (const [collectionId, queriesPerMetricParams] of this.queries) {
      for (const { metricParams, queriesPerSeries } of queriesPerMetricParams.values()) {
        promises.push(this.performFetchRequest(
          fetchData,
          collectionId,
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
   * @param {string|null} collectionId
   * @param {{ startTimestamp: number|null, limit: number}} metricParams
   * @param {QueriesPerSeries} queriesPerSeries
   * @returns {Promise<void>}
   */
  async performFetchRequest(
    fetchData,
    collectionId, {
      startTimestamp,
      limit,
    }, queriesPerSeries
  ) {
    const seriesToFetch = {};
    for (const [seriesId, queriesPerMetric] of queriesPerSeries) {
      seriesToFetch[seriesId] = [...queriesPerMetric.keys()];
    }
    let result;
    let resultIsError = false;
    try {
      result = await fetchData({
        collectionId,
        metrics: seriesToFetch,
        startTimestamp,
        limit,
      });
    } catch (error) {
      result = error;
      resultIsError = true;
    }

    for (const [seriesId, queriesPerMetric] of queriesPerSeries) {
      for (const [metricId, metricQueries] of queriesPerMetric) {
        for (const queryBatchEntry of metricQueries) {
          if (resultIsError) {
            queryBatchEntry.resultDefer.reject(result);
          } else {
            const entryResult = _.get(result, `${seriesId}.${metricId}`, []);
            queryBatchEntry.resultDefer.resolve(entryResult);
          }
        }
      }
    }
  }
}
