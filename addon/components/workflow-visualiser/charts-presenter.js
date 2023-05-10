/**
 * Generates charts visualisation for specific dashboard spec.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { browseModes } from 'onedata-gui-common/utils/atm-workflow/store-content-browse-options/time-series';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import layout from 'onedata-gui-common/templates/components/workflow-visualiser/charts-presenter';

/**
 * @typedef {TsNamesForCollectionGeneratorsCache}
 * @property {PromiseObject<Object<string, Array<string>>>} proxy Maps generator
 *   name to an array of time series names created by that generator
 * @property {number|null} lastUpdateTimestamp Null when periodic updating is
 *   not necessary
 */

export default Component.extend({
  layout,
  classNames: ['workflow-visualiser-charts-presenter'],

  /**
   * @virtual
   * @type {AtmTimeSeriesDashboardSpec}
   */
  dashboardSpec: undefined,

  /**
   * @virtual
   * @type {() => AtmTimeSeriesCollectionReferencesMap}
   */
  onGetTimeSeriesCollectionRefsMap: undefined,

  /**
   * @virtual
   * @type {(store: Utils.WorkflowVisualiser.Store, browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>}
   */
  onGetStoreContent: undefined,

  /**
   * @virtual optional
   * @type {AtmTimeSeriesCollectionReference}
   */
  defaultTimeSeriesCollectionRef: undefined,

  /**
   * @virtual optional
   * @type {boolean}
   */
  live: false,

  /**
   * @type {number}
   */
  tsDataReloadInterval: 3,

  /**
   * @type {{ map: AtmTimeSeriesCollectionReferencesMap, lastUpdateTimestamp: number|null } | undefined}
   */
  timeSeriesCollectionRefsMapCache: undefined,

  /**
   * @type {Map<AtmTimeSeriesCollectionReference, TsNamesForCollectionGeneratorsCache>}
   */
  tsNamesPerGeneratorCache: undefined,

  /**
   * @type {ComputedProperty<(collectionId?: AtmTimeSeriesCollectionReference) => Promise<Array<TimeSeriesSchema>>>}
   */
  onGetTimeSeriesSchemas: computed(function onGetTimeSeriesSchemas() {
    return async (...args) => this.getTimeSeriesSchemas(...args);
  }),

  /**
   * @type {ComputedProperty<({ dataSourceName: string, batchedQuery: BatchedTimeSeriesQuery }) => Promise<BatchedTimeSeriesQueryResult>>}
   */
  onQueryBatcherFetchData: computed(function onQueryBatcherFetchData() {
    return (...args) => this.queryBatcherFetchData(...args);
  }),

  /**
   * @type {ComputedProperty<OneTimeSeriesChartsSectionSpec>}
   */
  rootChartsSection: reads('dashboardSpec.rootSection'),

  /**
   * @type {ComputedProperty<OTSCExternalDataSources>}
   */
  externalDataSources: computed(function externalDataSources() {
    return {
      store: {
        fetchDynamicSeriesConfigs: (...args) =>
          this.fetchDynamicSeriesConfigs(...args),
      },
    };
  }),

  init() {
    this._super(...arguments);
    this.set('tsNamesPerGeneratorCache', new Map());
  },

  /**
   * @returns {AtmTimeSeriesCollectionReferencesMap}
   */
  getTimeSeriesCollectionRefsMap() {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    let mapCache = this.timeSeriesCollectionRefsMapCache;
    if (!mapCache) {
      mapCache = this.set('timeSeriesCollectionRefsMapCache', {});
    }

    const timeSinceLastUpdate = nowTimestamp - (mapCache.lastUpdateTimestamp ?? 0);
    if (
      !mapCache.map ||
      this.live && timeSinceLastUpdate > this.tsDataReloadInterval ||
      !this.live && mapCache.lastUpdateTimestamp
    ) {
      mapCache.map = this.onGetTimeSeriesCollectionRefsMap?.() ?? new Map();
      mapCache.lastUpdateTimestamp = this.live ? nowTimestamp : null;
    }

    return mapCache.map;
  },

  /**
   * @param {AtmTimeSeriesCollectionReference|null|undefined} collectionRef
   * @returns {Utils.WorkflowVisualiser.Store|null}
   */
  getStoreByCollectionRef(collectionRef) {
    const refsMap = this.getTimeSeriesCollectionRefsMap();
    if (refsMap.has(collectionRef)) {
      return refsMap.get(collectionRef);
    } else if (!collectionRef && refsMap.has(this.defaultTimeSeriesCollectionRef)) {
      return refsMap.get(this.defaultTimeSeriesCollectionRef);
    } else {
      return null;
    }
  },

  /**
   * @param {AtmTimeSeriesCollectionReference} collectionRef
   * @returns {Array<TimeSeriesSchema>}
   */
  getTimeSeriesSchemas(collectionRef) {
    const store = this.getStoreByCollectionRef(collectionRef);
    return store?.config?.timeSeriesCollectionSchema?.timeSeriesSchemas ?? [];
  },

  /**
   * @param {{ batchedQuery: BatchedTimeSeriesQuery }} params
   * @returns {Promise<BatchedTimeSeriesQueryResult>}
   */
  async queryBatcherFetchData({ batchedQuery }) {
    const store = this.getStoreByCollectionRef(batchedQuery.collectionRef);
    if (!store?.instanceId) {
      return {};
    }

    const result = await this.onGetStoreContent?.(store, {
      type: 'timeSeriesStoreContentBrowseOptions',
      mode: browseModes.slice,
      layout: batchedQuery.layout,
      startTimestamp: batchedQuery.startTimestamp,
      windowLimit: batchedQuery.windowLimit,
      extendedInfo: true,
    });
    return result?.slice;
  },

  /**
   * @param {{ collectionRef?: AtmTimeSeriesCollectionReference, timeSeriesNameGenerator: string, metricNames: Array<string> }} sourceParameters
   * @returns {Promise<Array<{ id: string, name: string, loadSeriesSourceSpec: OTSCExternalDataSourceRefParameters }>>}
   */
  async fetchDynamicSeriesConfigs(sourceParameters) {
    const {
      collectionRef,
      timeSeriesNameGenerator,
      metricNames,
    } = (sourceParameters || {});
    if (!timeSeriesNameGenerator || !Array.isArray(metricNames)) {
      return [];
    }
    const tsNamesPerGenerator = await this.getCachedTsNamesPerGenerator(collectionRef);
    const timeSeriesNames = tsNamesPerGenerator[timeSeriesNameGenerator] || [];
    return timeSeriesNames.map((timeSeriesName) => ({
      id: collectionRef ? `${collectionRef}-${timeSeriesName}` : timeSeriesName,
      name: timeSeriesName,
      loadSeriesSourceSpec: {
        externalSourceName: 'store',
        externalSourceParameters: {
          collectionRef,
          timeSeriesNameGenerator,
          timeSeriesName,
          metricNames,
        },
      },
    }));
  },

  /**
   * Returns cached mapping (time series name generator) -> (array of time
   * series names). Takes care of any needed data reloading.
   * @param {AtmTimeSeriesCollectionReference} collectionRef
   * @returns {Promise<string, Array<string>>}
   */
  async getCachedTsNamesPerGenerator(collectionRef) {
    let cache = this.tsNamesPerGeneratorCache.get(collectionRef);
    const nowTimestamp = Math.floor(Date.now() / 1000);

    const doesCacheExist = Boolean(cache);
    const cacheFulfillsLiveMode = doesCacheExist &&
      cache.lastUpdateTimestamp !== null &&
      nowTimestamp - cache.lastUpdateTimestamp < this.tsDataReloadInterval;
    const cacheFulfillsNonLiveMode = doesCacheExist && cache.lastUpdateTimestamp === null;
    const cacheFulfillsCurrentLiveMode = (this.live && cacheFulfillsLiveMode) ||
      (!this.live && cacheFulfillsNonLiveMode);

    if (!cacheFulfillsCurrentLiveMode) {
      if (!doesCacheExist) {
        cache = {};
        this.tsNamesPerGeneratorCache.set(collectionRef, cache);
      }

      cache.proxy = promiseObject(this.getTsNamesPerGenerator(collectionRef));
      cache.lastUpdateTimestamp = this.live ? nowTimestamp : null;
    }

    return await cache.proxy;
  },

  /**
   * Returns mapping (time series name generator) -> (array of time series names)
   * @param {AtmTimeSeriesCollectionReference} collectionRef
   * @returns {Promise<Object<string, Array<string>>>}
   */
  async getTsNamesPerGenerator(collectionRef) {
    const layout = await this.getTimeSeriesCollectionLayout(collectionRef);
    const timeSeriesNames = Object.keys(layout);
    const nameGenerators = this.getTimeSeriesSchemas(collectionRef)
      ?.map(({ nameGenerator }) => nameGenerator) || [];

    const tsNamesPerGenerator = nameGenerators.reduce((acc, gen) => {
      acc[gen] = [];
      return acc;
    }, {});
    timeSeriesNames.forEach((timeSeriesName) => {
      for (const nameGenerator of nameGenerators) {
        if (timeSeriesName.startsWith(nameGenerator)) {
          tsNamesPerGenerator[nameGenerator].push(timeSeriesName);
        }
      }
    });

    return tsNamesPerGenerator;
  },

  /**
   * @param {AtmTimeSeriesCollectionReference} collectionRef
   * @returns {Promise<AtmTimeSeriesStoreLayoutContentBrowseResult['layout']>}
   */
  async getTimeSeriesCollectionLayout(collectionRef) {
    const store = this.getStoreByCollectionRef(collectionRef);
    if (!store?.instanceId) {
      return {};
    }

    const result = await this.onGetStoreContent?.(store, {
      type: 'timeSeriesStoreContentBrowseOptions',
      mode: browseModes.layout,
    });
    return result?.layout ?? {};
  },
});
