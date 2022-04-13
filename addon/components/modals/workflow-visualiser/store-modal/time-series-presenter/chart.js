/**
 * Shows single time series store chart.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/time-series-presenter/chart';
import OTSCConfiguration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import { metricResolutionsMap } from 'onedata-gui-common/utils/atm-workflow/store-config/time-series';

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

export default Component.extend({
  tagName: '',
  layout,
  onedataConnection: service(),

  /**
   * @virtual
   * @type {OTSCChartDefinition}
   */
  chartSpec: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  live: true,

  /**
   * @virtual
   * @type {TimeSeriesStoreGeneratorsState}
   */
  timeSeriesGeneratorsState: undefined,

  /**
   * @virtual
   * @type {Utils.OneTimeSeriesChart.QueryBatcher}
   */
  timeSeriesQueryBatcher: undefined,

  /**
   * @type {ComputedProperty<number>}
   */
  globalTimeSecondsOffset: reads('onedataConnection.globalTimeSecondsOffset'),

  /**
   * @type {ComputedProperty<Array<OTSCTimeResolutionSpec>>}
   */
  timeResolutionSpecs: computed(
    'chartSpec',
    function timeResolutionSpecs() {
      const chartSpec = this.get('chartSpec');
      const foundSeriesSources = [];

      // Extract series loaded via `loadSeries` function
      const objectsToCheck = chartSpec.series
        .map((factory) => get(factory, 'factoryArguments.seriesTemplate.data'))
        .filter(Boolean);
      while (objectsToCheck.length) {
        const objectToCheck = objectsToCheck.pop();
        if (
          objectToCheck.functionName === 'loadSeries' &&
          isExternalTsStoreSourceRef(objectToCheck.functionArguments)
        ) {
          foundSeriesSources.push(
            objectToCheck.functionArguments.sourceParameters.externalSourceParameters
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
      chartSpec.series
        .filter((series) => series && series.factoryName === 'dynamic')
        .map(({ factoryArguments }) => factoryArguments && factoryArguments.dynamicSeriesConfigs)
        .filter((dynamicSeriesConfigs) => isExternalTsStoreSourceRef(dynamicSeriesConfigs))
        .forEach((dynamicSeriesConfigs) =>
          foundSeriesSources.push(dynamicSeriesConfigs.sourceParameters.externalSourceParameters)
        );

      // Map found series sources to resolutions
      const resolutionsPerSource = foundSeriesSources
        .map(({ timeSeriesNameGenerator, metricIds }) =>
          metricIds
          .map((metricId) => this.getResolutionForMetric(timeSeriesNameGenerator, metricId))
          .filter((res) => typeof res === 'number')
        );
      const sortedCommonResolutions = _.intersection(...resolutionsPerSource)
        .sort((res1, res2) => res1 - res2);

      return sortedCommonResolutions.map((resolution) => ({
        timeResolution: resolution,
        pointsCount: pointsCountPerResolution[resolution],
        updateInterval: 5,
      })).filter(({ pointsCount }) => Boolean(pointsCount));
    }
  ),

  /**
   * @type {ComputedProperty<Utils.OneTimeSeriesChart.Configuration>}
   */
  chartConfiguration: computed(
    'timeResolutionSpecs',
    'globalTimeSecondsOffset',
    'chartSpec',
    function inboundChartConfig() {
      const {
        timeResolutionSpecs,
        globalTimeSecondsOffset,
        chartSpec,
      } = this.getProperties(
        'timeResolutionSpecs',
        'globalTimeSecondsOffset',
        'chartSpec',
      );
      return new OTSCConfiguration({
        nowTimestampOffset: globalTimeSecondsOffset || 0,
        chartDefinition: chartSpec,
        timeResolutionSpecs,
        externalDataSources: {
          store: {
            fetchSeries: (...args) => this.fetchSeries(...args),
            fetchDynamicSeriesConfigs: (...args) =>
              this.fetchDynamicSeriesConfigs(...args),
          },
        },
      });
    }
  ),

  liveObserver: observer('live', function liveObserver() {
    const {
      chartConfiguration,
      live,
    } = this.getProperties('chartConfiguration', 'live');
    chartConfiguration.setViewParameters({ live });
  }),

  timeSeriesGeneratorsStateObserver: observer(
    'timeSeriesGeneratorsState',
    function timeSeriesGeneratorsStateObserver() {
      const {
        chartConfiguration,
        live,
      } = this.getProperties('chartConfiguration', 'live');

      if (live) {
        // live chart will update itself on its own
        return;
      }
      // Simulate view parameters change to reload chart
      chartConfiguration.setViewParameters({});
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    this.liveObserver();
  },

  /**
   * @param {OTSCDataSourceFetchParams} seriesParameters
   * @param {{ timeSeriesNameGenerator: string, timeSeriesName: string, metricId: string }} sourceParameters
   * @returns {Promise<Array<OTSCRawSeriesPoint>>}
   */
  async fetchSeries(seriesParameters, sourceParameters) {
    const timeSeriesQueryBatcher = this.get('timeSeriesQueryBatcher');

    const metricId = this.getMetricForResolution(
      sourceParameters.timeSeriesNameGenerator,
      seriesParameters.timeResolution
    );
    if (!sourceParameters.timeSeriesName, !metricId) {
      return [];
    }
    const queryParams = {
      seriesId: sourceParameters.timeSeriesName,
      metricId,
      startTimestamp: seriesParameters.lastPointTimestamp,
      limit: seriesParameters.pointsCount,
    };
    return timeSeriesQueryBatcher.query(queryParams);
  },

  /**
   * @param {{ timeSeriesNameGenerator: string, metricIds: Array<string> }} sourceParameters
   * @returns {Promise<Array<{ id: string, name: string, loadSeriesSourceParameters: OTSCExternalDataSourceRefParameters }>>}
   */
  async fetchDynamicSeriesConfigs(sourceParameters) {
    const {
      timeSeriesNameGenerator,
      metricIds,
    } = (sourceParameters || {});
    if (!timeSeriesNameGenerator || !Array.isArray(metricIds)) {
      return [];
    }
    const generatorState = this.getGeneratorState(timeSeriesNameGenerator);
    const timeSeriesNames = generatorState && generatorState.timeSeriesNames || [];
    return timeSeriesNames.map((timeSeriesName) => ({
      id: timeSeriesName,
      name: timeSeriesName,
      loadSeriesSourceParameters: {
        externalSourceName: 'store',
        externalSourceParameters: {
          timeSeriesNameGenerator,
          timeSeriesName,
          metricIds,
        },
      },
    }));
  },

  getGeneratorState(timeSeriesNameGenerator) {
    if (!timeSeriesNameGenerator) {
      return;
    }

    const timeSeriesGeneratorsState = this.get('timeSeriesGeneratorsState');
    return timeSeriesGeneratorsState && timeSeriesGeneratorsState[timeSeriesNameGenerator];
  },

  /**
   * @param {string} timeSeriesNameGenerator
   * @param {string} metricId
   * @returns {number|undefined}
   */
  getResolutionForMetric(timeSeriesNameGenerator, metricId) {
    if (!metricId) {
      return;
    }

    const generatorState = this.getGeneratorState(timeSeriesNameGenerator);
    return generatorState && get(generatorState, `metricIdToResolutionMap.${metricId}`);
  },

  /**
   * @param {string} timeSeriesNameGenerator
   * @param {number} resolution
   * @returns {string}
   */
  getMetricForResolution(timeSeriesNameGenerator, resolution) {
    if (typeof resolution !== 'number') {
      return;
    }

    const generatorState = this.getGeneratorState(timeSeriesNameGenerator);
    return generatorState && get(generatorState, `resolutionToMetricIdMap.${resolution}`);
  },
});

function isExternalTsStoreSourceRef(sourceRef) {
  return sourceRef &&
    sourceRef.sourceType === 'external' &&
    sourceRef.sourceParameters &&
    sourceRef.sourceParameters.externalSourceName === 'store' &&
    sourceRef.sourceParameters.externalSourceParameters;
}
