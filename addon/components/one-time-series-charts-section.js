/**
 * Renders time series chart dashboard section according to settings passed via `sectionSpec`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import _ from 'lodash';
import { resolve, all as allFulfilled } from 'rsvp';
import { promise } from 'ember-awesome-macros';
import layout from '../templates/components/one-time-series-charts-section';
import OTSCConfiguration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import OTSCModel from 'onedata-gui-common/utils/one-time-series-chart/model';
import QueryBatcher from 'onedata-gui-common/utils/one-time-series-chart/query-batcher';
import escapeHtml from 'onedata-gui-common/utils/one-time-series-chart/escape-html';
import { timeSeriesMetricResolutionsMap } from 'onedata-gui-common/utils/time-series';
import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * @typedef {Object} OneTimeSeriesChartsSectionSpec
 * @property {OneTimeSeriesChartsSectionTitleSpec} [title]
 * @property {string} [description]
 * @property {boolean} [isExpandedByDefault]
 * @property {'independent'|'sharedWithinSection'} [chartNavigation]
 * `independent` means, that each chart in this section will have
 * it's own navigation toolbar. `sharedWithinSection` means that all charts
 * (except charts nested inside subsections) will share a single navigation toolbar.
 * @property {Array<OTSCChartDefinition>} [charts]
 * @property {Array<OneTimeSeriesChartsSectionSpec>} [sections]
 */

/**
 * @typedef {Object} OneTimeSeriesChartsSectionTitleSpec
 * @property {string} content
 * @property {string} [tip]
 */

const pointsCountPerResolution = {
  // 24 * 5 seconds -> 2 minutes
  [timeSeriesMetricResolutionsMap.fiveSeconds]: 24,
  // 30 * 1 minute -> 0.5 hour
  [timeSeriesMetricResolutionsMap.minute]: 30,
  // 24 * 1 hour -> 1 day
  [timeSeriesMetricResolutionsMap.hour]: 24,
  // 30 * 1 day -> 1 month
  [timeSeriesMetricResolutionsMap.day]: 30,
  // 13 * 1 week -> ~3 months (91 days)
  [timeSeriesMetricResolutionsMap.week]: 13,
  // 12 * 1 month -> ~1 year (360 days)
  [timeSeriesMetricResolutionsMap.month]: 12,
  // 10 * 1 year -> 10 years
  [timeSeriesMetricResolutionsMap.year]: 10,
};

export default Component.extend(I18n, {
  layout,
  classNames: ['one-time-series-charts-section'],

  guiUtils: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.oneTimeSeriesChartsSection',

  /**
   * @virtual
   * @type {boolean}
   */
  live: true,

  /**
   * @virtual
   * @type {OneTimeSeriesChartsSectionSpec|undefined}
   */
  sectionSpec: undefined,

  /**
   * @virtual
   * @type {(collectionId?: string) => Promise<Array<TimeSeriesSchema>>}
   */
  onGetTimeSeriesSchemas: undefined,

  /**
   * Chart external data sources available for all charts in this section.
   * Each of them does not have to provide `fetchSeries` callback - there is a
   * default implementation available in this component, which uses passed
   * `queryBatchers` or `onQueryBatcherFetchData`.
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
   * @type {ComputedProperty<string>}
   */
  titleContent: computed('sectionSpec.title.content', function titleContent() {
    return this.get('sectionSpec.title.content') || null;
  }),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  titleTip: computed('sectionSpec.title.tip', function titleTip() {
    const escapedTip = escapeHtml(this.get('sectionSpec.title.tip') || '');
    return escapedTip ? htmlSafe(escapedTip) : null;
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSharedNavVisible: computed(
    'sectionSpec.{chartNavigation,charts.length}',
    function isSharedNavVisible() {
      return this.sectionSpec?.chartNavigation === 'sharedWithinSection' &&
        this.sectionSpec?.charts?.length > 0;
    }
  ),

  /**
   * @type {ComputedProperty<SafeString>}
   */
  descriptionContent: computed(
    'sectionSpec.description',
    function descriptionContent() {
      const escapedDescription = escapeHtml(
        this.get('sectionSpec.description') || ''
      );
      return escapedDescription ? htmlSafe(escapedDescription) : null;
    }
  ),

  /**
   * @type {ComputedProperty<number>}
   */
  globalTimeSecondsOffset: reads('guiUtils.globalTimeSecondsOffset'),

  /**
   * @type {ComputedProperty<OTSCExternalDataSources>}
   */
  normalizedExternalDataSources: computed(
    'externalDataSources',
    function normalizedExternalDataSources() {
      const externalDataSources = this.get('externalDataSources') || {};
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
   * @type {ComputedProperty<PromiseArray<Utils.OneTimeSeriesChart.Configuration>>}
   */
  chartConfigurationsProxy: promise.array(computed(
    'sectionSpec.{charts,chartNavigation}',
    'globalTimeSecondsOffset',
    'normalizedExternalDataSources',
    async function chartConfigurationsProxy() {
      const chartSpecs = this.sectionSpec?.charts ?? [];
      const configurations = await allFulfilled(chartSpecs.map(async (chartSpec) => {
        const configuration = new OTSCConfiguration({
          nowTimestampOffset: this.globalTimeSecondsOffset ?? 0,
          chartDefinition: chartSpec,
          timeResolutionSpecs: await this.getTimeResolutionSpecs(chartSpec),
          externalDataSources: this.normalizedExternalDataSources,
        });
        configuration.setViewParameters({ live: this.live });

        return configuration;
      }));

      await this.synchronizeXAxisIfNeeded(configurations);

      return configurations;
    }
  )),

  /**
   * @type {ComputedProperty<PromiseArray<Utils.OneTimeSeriesChart.Model>>}
   */
  chartModelsProxy: promise.array(computed(
    'chartConfigurationsProxy',
    async function chartModelsProxy() {
      const chartConfigurations = await this.chartConfigurationsProxy;
      return chartConfigurations.map((configuration) =>
        OTSCModel.create({ configuration })
      );
    }
  )),

  liveObserver: observer('live', async function liveObserver() {
    const chartConfigurations = await this.chartConfigurationsProxy;
    chartConfigurations.forEach((config) => {
      if (config.getViewParameters().live !== this.live) {
        config.setViewParameters({ live: this.live });
      }
    });
    await this.synchronizeXAxisIfNeeded(chartConfigurations);
  }),

  init() {
    this._super(...arguments);

    let normalizedQueryBatchers = this.queryBatchers;
    if (!normalizedQueryBatchers) {
      this.initializeQueryBatchers();
      normalizedQueryBatchers = this.queryBatchers;
    }

    this.set('defaultCallbacks', new DefaultCallbacks({
      onGetTimeSeriesSchemas: this.onGetTimeSeriesSchemas,
      queryBatchers: normalizedQueryBatchers,
    }));
  },

  async willDestroyElement() {
    this._super(...arguments);
    const chartModelsProxy = this.cacheFor('chartModelsProxy');
    if (chartModelsProxy) {
      const chartModels = await this.chartModelsProxy;
      chartModels.forEach((model) => model.destroy());
    } else {
      const chartConfigurationsProxy = this.cacheFor('chartConfigurationProxy');
      if (chartConfigurationsProxy) {
        const chartConfigurations = await chartConfigurationsProxy;
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

  async getTimeResolutionSpecs(chartDefinition) {
    const {
      onGetTimeResolutionSpecs,
      defaultCallbacks,
    } = this.getProperties('onGetTimeResolutionSpecs', 'defaultCallbacks');
    const callback = onGetTimeResolutionSpecs ||
      defaultCallbacks.onGetTimeResolutionSpecs;
    return callback({ chartDefinition });
  },

  /**
   * When "live" option is false then all charts are considered as ended and
   * non-changing. In that case each of them can have its newest point at
   * different timestamp, which breaks down UX a bit - it is hard to compare
   * charts when X (time) axes are not the same. Especially when section has
   * shared controls to go forth and back in chart view. To solve this issue
   * we fetch newest points for each of chart configuration, compare them
   * and then set fake newest point timestamp in charts, which are behind in
   * time comparing to the "newest" chart.
   * @param {Array<Utils.OneTimeSeriesChart.Configuration>} chartConfigurations
   * @returns {void}
   */
  async synchronizeXAxisIfNeeded(chartConfigurations) {
    if (this.live || this.sectionSpec?.chartNavigation !== 'sharedWithinSection') {
      return;
    }

    const prefetchedStates = [];
    const nonFakePrefetchedStates = [];
    await allFulfilled(chartConfigurations.map(async (configuration) => {
      configuration.setViewParameters({ lastPointTimestamp: null });
      const prefetchedState = await configuration.getState();
      prefetchedStates.push(prefetchedState);
      const allPoints = _.flatten(prefetchedState.series.map(({ data }) => data));
      if (allPoints.find(({ fake }) => !fake)) {
        nonFakePrefetchedStates.push(prefetchedState);
      }
    }));

    const statesToAnalyse = nonFakePrefetchedStates.length ?
      nonFakePrefetchedStates : prefetchedStates;
    const maxNewestPointTimestamp = Math.max(
      ...statesToAnalyse.map(({ newestPointTimestamp }) => newestPointTimestamp)
    );
    chartConfigurations.forEach((configuration) => {
      configuration.newestPointTimestamp = maxNewestPointTimestamp;
      configuration.newestEdgeTimestamp =
        maxNewestPointTimestamp +
        configuration.getViewParameters().timeResolution - 1;
      configuration.setViewParameters({
        lastPointTimestamp: maxNewestPointTimestamp,
      });
    });
  },
});

// Contains default implementations of some of the callbacks needed by the component
// and which are optional to provide through component API.
export class DefaultCallbacks {
  constructor({ onGetTimeSeriesSchemas, queryBatchers }) {
    // Default `onGetTimeResolutionSpecs` when none was provided to the component
    this.onGetTimeResolutionSpecs = ({ chartDefinition }) =>
      getTimeResolutionSpecs({
        chartDefinition,
        onGetTimeSeriesSchemas,
      });
    // Default `fetchSeries` when external source does not provide any
    this.fetchSeries = Object.keys(queryBatchers).reduce((acc, dataSourceName) => {
      acc[dataSourceName] = (seriesParameters, sourceParameters) => fetchSeries({
        seriesParameters,
        sourceParameters,
        onGetTimeSeriesSchemas,
        queryBatcher: queryBatchers[dataSourceName],
      });
      return acc;
    }, {});
    // Default `fetchDynamicSeriesConfigs` when external source does not provide any
    this.fetchDynamicSeriesConfigs = (sourceParameters) =>
      fetchDynamicSeriesConfigs({
        sourceParameters,
      });
  }
}

/**
 * @param {{ chartDefinition: OTSCChartDefinition, onGetTimeSeriesSchemas: (collectionRef: string) => Promise<Array<TimeSeriesSchema>> }} params
 * @returns {Array<OTSCTimeResolutionSpec>}
 */
async function getTimeResolutionSpecs({
  chartDefinition,
  onGetTimeSeriesSchemas,
}) {
  const seriesBuildersSpecs = (chartDefinition && chartDefinition.seriesBuilders || [])
    .filter(Boolean);
  const foundSeriesSources = [];

  // Extract series loaded via `loadSeries` function
  const objectsToCheck = seriesBuildersSpecs
    .map((builder) => get(builder, 'builderRecipe.seriesTemplate.dataProvider'))
    .filter(Boolean);
  while (objectsToCheck.length) {
    const objectToCheck = objectsToCheck.pop();
    const externalSourceRef = objectToCheck.functionName === 'loadSeries' &&
      extractExternalDataSourceRef(objectToCheck.functionArguments);
    if (externalSourceRef) {
      foundSeriesSources.push(externalSourceRef.externalSourceParameters);
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
  seriesBuildersSpecs
    .map(({ builderType, builderRecipe }) =>
      builderType === 'dynamic' &&
      builderRecipe &&
      builderRecipe.dynamicSeriesConfigsSource &&
      extractExternalDataSourceRef(builderRecipe.dynamicSeriesConfigsSource) ||
      null
    )
    .forEach((externalSourceRef) => {
      if (externalSourceRef) {
        foundSeriesSources.push(
          externalSourceRef.externalSourceParameters
        );
      }
    });

  // Map found series sources to resolutions
  const resolutionsPerSource = await allFulfilled(
    foundSeriesSources.map(async ({
      collectionRef,
      timeSeriesNameGenerator,
      metricNames,
    }) => getResolutionsForMetricNames({
      timeSeriesSchemas: await onGetTimeSeriesSchemas(collectionRef),
      timeSeriesNameGenerator,
      metricNames,
    }))
  );
  const sortedCommonResolutions = _.intersection(...resolutionsPerSource)
    .sort((res1, res2) => res1 - res2);

  return sortedCommonResolutions.map((resolution) => ({
    timeResolution: resolution,
    pointsCount: pointsCountPerResolution[resolution],
    updateInterval: 5,
  })).filter(({ pointsCount }) => Boolean(pointsCount));
}

/**
 * @param {unknown} possibleSourceRef
 * @returns {OTSCExternalDataSourceRefParameters|null}
 */
function extractExternalDataSourceRef(possibleSourceRef) {
  let refCandidate = null;
  if (possibleSourceRef && possibleSourceRef.sourceType === 'external') {
    if (possibleSourceRef.sourceSpecProvider &&
      possibleSourceRef.sourceSpecProvider.functionName === 'literal' &&
      possibleSourceRef.sourceSpecProvider.functionArguments
    ) {
      refCandidate = possibleSourceRef.sourceSpecProvider.functionArguments.data;
    } else if (possibleSourceRef.sourceSpec) {
      refCandidate = possibleSourceRef.sourceSpec;
    }
  }

  if (
    refCandidate &&
    refCandidate.externalSourceName &&
    refCandidate.externalSourceParameters
  ) {
    return refCandidate;
  }

  return null;
}

/**
 * Returns possible resolutions (in seconds) for specific TS name generator and metric names
 * @param {{ timeSeriesSchemas: Array<TimeSeriesSchema>, timeSeriesNameGenerator: string, metricNames: Array<string> }} params
 * @returns {Array<number>}
 */
function getResolutionsForMetricNames({
  timeSeriesSchemas,
  timeSeriesNameGenerator,
  metricNames,
}) {
  const foundTimeSeriesSchema = (timeSeriesSchemas || []).find((schema) =>
    schema && schema.nameGenerator === timeSeriesNameGenerator
  );
  if (!foundTimeSeriesSchema || !foundTimeSeriesSchema.metrics) {
    return [];
  }
  const resolutions = (metricNames || []).map((metricName) =>
    foundTimeSeriesSchema.metrics[metricName] &&
    foundTimeSeriesSchema.metrics[metricName].resolution ||
    null
  ).filter(Boolean);
  return [...new Set(resolutions)];
}

/**
 * Loads series points according to passed parameters. Uses a query batcher to batch requests.
 * @param {{ seriesParameters: OTSCDataSourceFetchParams, sourceParameters: Object, onGetTimeSeriesSchemas: (collectionRef: string) => Promise<Array<TimeSeriesSchema>>, queryBatcher: Utils.OneTimeSeriesChart.QueryBatcher }} params
 * @returns {Promise<Array<OTSCRawSeriesPoint>>}
 */
async function fetchSeries({
  seriesParameters,
  sourceParameters,
  onGetTimeSeriesSchemas,
  queryBatcher,
}) {
  if (
    !seriesParameters?.timeResolution ||
    !sourceParameters?.timeSeriesName ||
    !sourceParameters?.timeSeriesNameGenerator
  ) {
    return [];
  }
  const metricName = getMetricNameForResolution({
    timeSeriesSchemas: await onGetTimeSeriesSchemas(sourceParameters.collectionRef),
    timeSeriesNameGenerator: sourceParameters.timeSeriesNameGenerator,
    resolution: seriesParameters.timeResolution,
  });
  if (!metricName) {
    return [];
  }

  const queryParams = {
    collectionRef: sourceParameters.collectionRef,
    seriesName: sourceParameters.timeSeriesName,
    metricName,
    startTimestamp: seriesParameters.lastPointTimestamp,
    windowLimit: seriesParameters.pointsCount,
  };

  return queryBatcher.query(queryParams);
}

/**
 * @param {{ timeSeriesSchemas: Array<TimeSeriesSchema>, timeSeriesNameGenerator: string, resolution: number }} params
 * @returns {string|null}
 */
function getMetricNameForResolution({
  timeSeriesSchemas,
  timeSeriesNameGenerator,
  resolution,
}) {
  const foundTimeSeriesSchema = (timeSeriesSchemas || []).find((schema) =>
    schema && schema.nameGenerator === timeSeriesNameGenerator
  );
  if (!foundTimeSeriesSchema || !foundTimeSeriesSchema.metrics) {
    return null;
  }
  for (const metricName in foundTimeSeriesSchema.metrics) {
    if (foundTimeSeriesSchema.metrics[metricName].resolution === resolution) {
      return metricName;
    }
  }
  return null;
}

function fetchDynamicSeriesConfigs() {
  return resolve([]);
}
