import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import { resolve } from 'rsvp';
import layout from '../templates/components/one-time-series-charts-section';
import OTSCConfiguration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import OTSCModel from 'onedata-gui-common/utils/one-time-series-chart/model';
import QueryBatcher from 'onedata-gui-common/utils/one-time-series-chart/query-batcher';
import { metricResolutionsMap } from 'onedata-gui-common/utils/atm-workflow/store-config/time-series';

/**
 * @typedef {Object} OneTimeSeriesChartsSectionSpec
 * @property {OneTimeSeriesChartsSectionTitleSpec} [title]
 * @property {OneTimeSeriesChartsSectionDescriptionSpec} [description]
 * @property {boolean} [isExpandedByDefault]
 * @property {'perChart'|'sharedForSection'} [chartsNavigation]
 * @property {Array<OTSCChartDefinition>} [charts]
 * @property {Array<OneTimeSeriesChartsSectionSpec>} [sections]
 */

/**
 * @typedef {Object} OneTimeSeriesChartsSectionTitleSpec
 * @property {string} content
 * @property {string} [tip]
 */

/**
 * @typedef {Object} OneTimeSeriesChartsSectionDescriptionSpec
 * @property {string} content
 */

export default Component.extend({
  layout,
  classNames: ['one-time-series-charts-section'],

  onedataConnection: service(),

  /**
   * @virtual
   * @type {OneTimeSeriesChartsSectionSpec}
   */
  sectionSpec: undefined,

  /**
   * @type {Array<AtmTimeSeriesSchema>}
   */
  timeSeriesSchemas: undefined,

  /**
   * @virtual
   * @type {OTSCExternalDataSources}
   */
  externalDataSources: undefined,

  /**
   * Contains query batchers per each external data source name.
   * At least one of `queryBatchers` or `onQueryBatcherFetchData` must be provided during
   * component instantiation.
   * @virtual optional
   * @type {Object<string, Utils.OneTimeSeriesChart.QueryBatcher>}
   */
  queryBatchers: undefined,

  /**
   * Callback, which should provide response data for batched time series queries.
   * At least one of `queryBatchers` or `onQueryBatcherFetchData` must be provided during
   * component instantiation.
   * @virtual optional
   * @type {({ dataSourceName: string, batchedQuery: BatchedTimeSeriesQuery }) => Promise<BatchedTimeSeriesQueryResult>}
   */
  onQueryBatcherFetchData: undefined,

  /**
   * @virtual optional
   * @type {ComputedProperty<({ chartDefinition: OTSCChartDefinition }) => Array<OTSCTimeResolutionSpec>>}
   */
  onGetTimeResolutionSpecs: undefined,

  /**
   * @type {DefaultCallbacks}
   */
  defaultCallbacks: undefined,

  /**
   * @type {ComputedProperty<number>}
   */
  globalTimeSecondsOffset: reads('onedataConnection.globalTimeSecondsOffset'),

  /**
   * @type {ComputedProperty<OTSCExternalDataSources>}
   */
  normalizedExternalDataSources: computed(
    'externalDataSources',
    function normalizedExternalDataSources() {
      const externalDataSources = this.get('externalDataSources');
      const normalizedSources = {};

      Object.keys(externalDataSources).forEach((sourceName) => {
        const source = Object.assign({}, externalDataSources[sourceName] || {});
        if (!source.fetchSeries) {
          source.fetchSeries = (...args) =>
            this.get('defaultCallbacks').fetchSeries[sourceName](...args);
        }
        if (!source.fetchDynamicSeriesConfigs) {
          source.fetchDynamicSeriesConfigs = (...args) =>
            this.get('defaultCallbacks').fetchDynamicSeriesConfigs(...args);
        }
        normalizedSources[sourceName] = source;
      });

      return normalizedSources;
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.OneTimeSeriesChart.Configuration>>}
   */
  chartConfigurations: computed(
    'sectionSpec.charts',
    'globalTimeSecondsOffset',
    'normalizedExternalDataSources',
    function chartConfigurations() {
      const chartSpecs = this.get('sectionSpec.charts') || [];
      const {
        globalTimeSecondsOffset,
        normalizedExternalDataSources,
      } = this.getProperties(
        'globalTimeSecondsOffset',
        'normalizedExternalDataSources',
      );
      return chartSpecs.map((chartSpec) => {
        const configuration = new OTSCConfiguration({
          nowTimestampOffset: globalTimeSecondsOffset || 0,
          chartDefinition: chartSpec,
          timeResolutionSpecs: this.getTimeResolutionSpecs({
            chartDefinition: chartSpec,
          }),
          externalDataSources: normalizedExternalDataSources,
        });
        configuration.setViewParameters({ live: true });
        return configuration;
      });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Utils.OneTimeSeriesChart.Model>>}
   */
  chartModels: computed('chartConfigurations.[]', function chartModels() {
    return this.get('chartConfigurations').map((configuration) =>
      OTSCModel.create({ configuration })
    );
  }),

  init() {
    this._super(...arguments);
    const {
      timeSeriesSchemas,
      queryBatchers,
    } = this.getProperties('timeSeriesSchemas', 'queryBatchers');

    let normalizedQueryBatchers = queryBatchers;
    if (!normalizedQueryBatchers) {
      this.initializeQueryBatchers();
      normalizedQueryBatchers = this.get('queryBatchers');
    }

    this.set('defaultCallbacks', new DefaultCallbacks({
      timeSeriesSchemas,
      queryBatchers: normalizedQueryBatchers,
    }));
  },

  willDestroyElement() {
    this._super(...arguments);
    const chartModels = this.cacheFor('chartModels');
    if (chartModels) {
      chartModels.forEach((model) => model.destroy());
    } else {
      const chartConfigurations = this.cacheFor('chartConfiguration');
      if (chartConfigurations) {
        chartConfigurations.forEach((config) => config.destroy());
      }
    }
  },

  initializeQueryBatchers() {
    this.set('queryBatchers', Object.keys(this.get('externalDataSources') || {})
      .reduce((acc, dataSourceName) => {
        acc[dataSourceName] = new QueryBatcher({
          fetchData: (batchedQuery) => this.get('onQueryBatcherFetchData')({
            dataSourceName,
            batchedQuery,
          }),
        });
        return acc;
      }, {}));
  },

  getTimeResolutionSpecs({ chartDefinition }) {
    const {
      onGetTimeResolutionSpecs,
      defaultCallbacks,
    } = this.getProperties('onGetTimeResolutionSpecs', 'defaultCallbacks');
    const callback = onGetTimeResolutionSpecs ||
      defaultCallbacks.onGetTimeResolutionSpecs;
    return callback({ chartDefinition });
  },
});

class DefaultCallbacks {
  constructor({ timeSeriesSchemas, queryBatchers }) {
    this.onGetTimeResolutionSpecs = ({ chartDefinition }) =>
      getTimeResolutionSpecs({
        chartDefinition,
        timeSeriesSchemas,
      });
    this.fetchSeries = Object.keys(queryBatchers).reduce((acc, dataSourceName) => {
      acc[dataSourceName] = (seriesParameters, sourceParameters) => fetchSeries({
        seriesParameters,
        sourceParameters,
        timeSeriesSchemas,
        queryBatcher: queryBatchers[dataSourceName],
      });
      return acc;
    }, {});
    this.fetchDynamicSeriesConfigs = (sourceParameters) =>
      fetchDynamicSeriesConfigs({
        sourceParameters,
      });
  }
}

const pointsCountPerResolution = {
  // 24 * 5 seconds -> 2 minutes
  [metricResolutionsMap.fiveSeconds]: 24,
  // 30 * 1 minute -> 0.5 hour
  [metricResolutionsMap.minute]: 30,
  // 24 * 1 hour -> 1 day
  [metricResolutionsMap.hour]: 24,
  // 30 * 1 day -> 1 month
  [metricResolutionsMap.day]: 30,
  // 13 * 1 week -> ~3 months (91 days)
  [metricResolutionsMap.week]: 13,
  // 12 * 1 month -> ~1 year (360 days)
  [metricResolutionsMap.month]: 12,
  // 10 * 1 year -> 10 years
  [metricResolutionsMap.year]: 10,
};

function getTimeResolutionSpecs({
  chartDefinition,
  timeSeriesSchemas,
}) {
  const seriesFactoriesSpecs = (chartDefinition && chartDefinition.series || [])
    .filter(Boolean);
  const foundSeriesSources = [];

  // Extract series loaded via `loadSeries` function
  const objectsToCheck = seriesFactoriesSpecs
    .map((factory) => get(factory, 'factoryArguments.seriesTemplate.data'))
    .filter(Boolean);
  while (objectsToCheck.length) {
    const objectToCheck = objectsToCheck.pop();
    if (
      objectToCheck.functionName === 'loadSeries' &&
      isExternalDataSourceRef(objectToCheck.functionArguments)
    ) {
      foundSeriesSources.push(
        objectToCheck
        .functionArguments
        .sourceParameters
        .externalSourceParameters
      );
    } else if (Array.isArray(objectToCheck)) {
      for (const item of objectToCheck) {
        if (typeof item === 'object' && item) {
          objectsToCheck.push(item);
        }
      }
    } else {
      for (const key in objectToCheck) {
        if (typeof objectToCheck[key] === 'object' && objectToCheck[key]) {
          objectsToCheck.push(objectToCheck[key]);
        }
      }
    }
  }

  // Extract series loaded via dynamic series
  seriesFactoriesSpecs
    .map(({ factoryName, factoryArguments }) =>
      factoryName === 'dynamic' &&
      factoryArguments &&
      factoryArguments.dynamicSeriesConfigs ||
      null
    )
    .filter((dynamicSeriesConfigs) =>
      isExternalDataSourceRef(dynamicSeriesConfigs)
    )
    .forEach((dynamicSeriesConfigs) =>
      foundSeriesSources.push(
        dynamicSeriesConfigs.sourceParameters.externalSourceParameters
      )
    );

  // Map found series sources to resolutions
  const resolutionsPerSource = foundSeriesSources
    .map(({ timeSeriesNameGenerator, metricIds }) => getResolutionsForMetricIds({
      timeSeriesSchemas,
      timeSeriesNameGenerator,
      metricIds,
    }));
  const sortedCommonResolutions = _.intersection(...resolutionsPerSource)
    .sort((res1, res2) => res1 - res2);

  return sortedCommonResolutions.map((resolution) => ({
    timeResolution: resolution,
    pointsCount: pointsCountPerResolution[resolution],
    updateInterval: 5,
  })).filter(({ pointsCount }) => Boolean(pointsCount));
}

function isExternalDataSourceRef(sourceRef) {
  return sourceRef &&
    sourceRef.sourceType === 'external' &&
    sourceRef.sourceParameters &&
    sourceRef.sourceParameters.externalSourceName &&
    sourceRef.sourceParameters.externalSourceParameters;
}

function getResolutionsForMetricIds({
  timeSeriesSchemas,
  timeSeriesNameGenerator,
  metricIds,
}) {
  const foundTimeSeriesSchema = (timeSeriesSchemas || []).find((schema) =>
    schema && schema.nameGenerator === timeSeriesNameGenerator
  );
  if (!foundTimeSeriesSchema || !foundTimeSeriesSchema.metrics) {
    return [];
  }
  const resolutions = (metricIds || []).map((metricId) =>
    foundTimeSeriesSchema.metrics[metricId] &&
    foundTimeSeriesSchema.metrics[metricId].resolution ||
    null
  ).filter(Boolean);
  return [...new Set(resolutions)];
}

function fetchSeries({
  seriesParameters,
  sourceParameters,
  timeSeriesSchemas,
  queryBatcher,
}) {
  if (!seriesParameters ||
    !seriesParameters.timeResolution ||
    !sourceParameters ||
    !sourceParameters.timeSeriesName ||
    !sourceParameters.timeSeriesNameGenerator
  ) {
    return resolve([]);
  }
  const metricId = getMetricIdForResolution({
    timeSeriesSchemas,
    timeSeriesNameGenerator: sourceParameters.timeSeriesNameGenerator,
    resolution: seriesParameters.timeResolution,
  });
  if (!metricId) {
    return resolve([]);
  }

  const queryParams = {
    seriesId: sourceParameters.timeSeriesName,
    metricId,
    startTimestamp: seriesParameters.lastPointTimestamp,
    limit: seriesParameters.pointsCount,
  };

  return queryBatcher.query(queryParams);
}

function getMetricIdForResolution({
  timeSeriesSchemas,
  timeSeriesNameGenerator,
  resolution,
}) {
  const foundTimeSeriesSchema = (timeSeriesSchemas || []).find((schema) =>
    schema && schema.nameGenerator === timeSeriesNameGenerator
  );
  if (!foundTimeSeriesSchema || !foundTimeSeriesSchema.metrics) {
    return [];
  }
  for (const metricId in foundTimeSeriesSchema.metrics) {
    if (foundTimeSeriesSchema.metrics[metricId].resolution === resolution) {
      return metricId;
    }
  }
  return null;
}

function fetchDynamicSeriesConfigs() {
  return resolve([]);
}
