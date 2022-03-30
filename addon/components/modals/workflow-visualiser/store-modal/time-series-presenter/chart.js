import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import layout from '../../../../../templates/components/modals/workflow-visualiser/store-modal/time-series-presenter/chart';
import OTSCConfiguration from 'onedata-gui-common/utils/one-time-series-chart/configuration';

export default Component.extend({
  layout,
  onedataConnection: service(),

  /**
   * @virtual
   */
  chartSpec: undefined,

  /**
   * @virtual
   * @type {?}
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

  timeResolutionSpecs: computed(
    'chartSpec',
    function timeResolutionSpecs() {
      const chartSpec = this.get('chartSpec');
      const foundSeriesSources = [];

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

      chartSpec.series
        .filter((series) => series && series.factoryName === 'dynamic')
        .map(({ factoryArguments }) => factoryArguments && factoryArguments.dynamicSeriesConfigs)
        .filter((dynamicSeriesConfigs) => isExternalTsStoreSourceRef(dynamicSeriesConfigs))
        .forEach((dynamicSeriesConfigs) =>
          foundSeriesSources.push(dynamicSeriesConfigs.sourceParameters.externalSourceParameters)
        );

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
        pointsCount: 30,
        updateInterval: 5,
      }));
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
        'chartSpec'
      );
      const config = new OTSCConfiguration({
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
      config.setViewParameters({ live: true });
      return config;
    }
  ),

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
    const timeSeriesNames = this.get(`timeSeriesGeneratorsState.${timeSeriesNameGenerator}.timeSeriesNames`);
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

  getResolutionForMetric(timeSeriesNameGenerator, metricId) {
    if (!timeSeriesNameGenerator || !metricId) {
      return;
    }

    return this.get(
      `timeSeriesGeneratorsState.${timeSeriesNameGenerator}.metricIdToResolutionMap.${metricId}`
    );
  },

  getMetricForResolution(timeSeriesNameGenerator, resolution) {
    if (!timeSeriesNameGenerator || typeof resolution !== 'number') {
      return;
    }

    return this.get(
      `timeSeriesGeneratorsState.${timeSeriesNameGenerator}.resolutionToMetricIdMap.${resolution}`
    );
  },
});

function isExternalTsStoreSourceRef(sourceRef) {
  return sourceRef &&
    sourceRef.sourceType === 'external' &&
    sourceRef.sourceParameters &&
    sourceRef.sourceParameters.externalSourceName === 'store' &&
    sourceRef.sourceParameters.externalSourceParameters;
}
