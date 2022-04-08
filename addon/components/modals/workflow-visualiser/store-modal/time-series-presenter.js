import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads, notEmpty } from '@ember/object/computed';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/time-series-presenter';
import QueryBatcher from 'onedata-gui-common/utils/one-time-series-chart/query-batcher';
import { browseModes } from 'onedata-gui-common/utils/atm-workflow/store-content-browse-options/time-series';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import Looper from 'onedata-gui-common/utils/looper';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

const timeSeriesGeneratorStateReloadInterval = 5000;

export default Component.extend(I18n, createDataProxyMixin('timeSeriesGeneratorsState'), {
  layout,
  classNames: ['time-series-presenter'],
  classNameBindings: ['hasCharts:has-charts:no-charts'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.workflowVisualiser.storeModal.timeSeriesPresenter',

  /**
   * @virtual
   * @type {Object}
   */
  store: undefined,

  /**
   * @virtual
   * @type {(browseOptions: AtmStoreContentBrowseOptions) => Promise<AtmStoreContentBrowseResult|null>}
   */
  getStoreContentCallback: undefined,

  /**
   * @type {number}
   */
  timeSeriesGeneratorStateReloadInterval,

  /**
   * @type {Utils.Looper}
   */
  timeSeriesGeneratorStateUpdater: undefined,

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  chartSpecs: reads('store.config.chartSpecs'),
  // chartSpecs: computed(() => [{
  //   title: {
  //     content: 'some title',
  //   },
  //   yAxes: [{
  //     id: 'axis',
  //     minInterval: 1,
  //   }],
  //   series: [{
  //     factoryName: 'static',
  //     factoryArguments: {
  //       seriesTemplate: {
  //         id: 'series1',
  //         name: 'Series 1',
  //         type: 'line',
  //         yAxisId: 'axis',
  //         data: {
  //           functionName: 'replaceEmpty',
  //           functionArguments: {
  //             data: {
  //               functionName: 'loadSeries',
  //               functionArguments: {
  //                 sourceType: 'external',
  //                 sourceParameters: {
  //                   externalSourceName: 'store',
  //                   externalSourceParameters: {
  //                     timeSeriesNameGenerator: 'gen_size',
  //                     timeSeriesName: 'gen_size',
  //                     metricIds: ['sum5s', 'sum1m', 'sum1h'],
  //                   },
  //                 },
  //               },
  //             },
  //             fallbackValue: 0,
  //           },
  //         },
  //       },
  //     },
  //   }, {
  //     factoryName: 'dynamic',
  //     factoryArguments: {
  //       dynamicSeriesConfigs: {
  //         sourceType: 'external',
  //         sourceParameters: {
  //           externalSourceName: 'store',
  //           externalSourceParameters: {
  //             timeSeriesNameGenerator: 'gen_file_',
  //             metricIds: ['sum5s', 'sum1m', 'sum1h'],
  //           },
  //         },
  //       },
  //       seriesTemplate: {
  //         id: {
  //           functionName: 'getDynamicSeriesConfigData',
  //           functionArguments: {
  //             propertyName: 'id',
  //           },
  //         },
  //         name: {
  //           functionName: 'getDynamicSeriesConfigData',
  //           functionArguments: {
  //             propertyName: 'name',
  //           },
  //         },
  //         type: 'bar',
  //         stackId: 'stack1',
  //         yAxisId: 'axis',
  //         data: {
  //           functionName: 'replaceEmpty',
  //           functionArguments: {
  //             data: {
  //               functionName: 'loadSeries',
  //               functionArguments: {
  //                 sourceType: 'external',
  //                 sourceParameters: {
  //                   functionName: 'getDynamicSeriesConfigData',
  //                   functionArguments: {
  //                     propertyName: 'loadSeriesSourceParameters',
  //                   },
  //                 },
  //               },
  //             },
  //             fallbackValue: 0,
  //           },
  //         },
  //       },
  //     },
  //   }],
  // }, {
  //   title: {
  //     content: 'some title',
  //   },
  //   yAxes: [{
  //     id: 'axis',
  //     minInterval: 1,
  //   }],
  //   series: [{
  //     factoryName: 'static',
  //     factoryArguments: {
  //       seriesTemplate: {
  //         id: 'series1',
  //         name: 'Series 1',
  //         type: 'line',
  //         yAxisId: 'axis',
  //         data: {
  //           functionName: 'replaceEmpty',
  //           functionArguments: {
  //             data: {
  //               functionName: 'loadSeries',
  //               functionArguments: {
  //                 sourceType: 'external',
  //                 sourceParameters: {
  //                   externalSourceName: 'store',
  //                   externalSourceParameters: {
  //                     timeSeriesNameGenerator: 'gen_size',
  //                     timeSeriesName: 'gen_size',
  //                     metricIds: ['sum5s', 'sum1m', 'sum1h'],
  //                   },
  //                 },
  //               },
  //             },
  //             fallbackValue: 0,
  //           },
  //         },
  //       },
  //     },
  //   }, {
  //     factoryName: 'dynamic',
  //     factoryArguments: {
  //       dynamicSeriesConfigs: {
  //         sourceType: 'external',
  //         sourceParameters: {
  //           externalSourceName: 'store',
  //           externalSourceParameters: {
  //             timeSeriesNameGenerator: 'gen_file_',
  //             metricIds: ['sum5s', 'sum1m', 'sum1h'],
  //           },
  //         },
  //       },
  //       seriesTemplate: {
  //         id: {
  //           functionName: 'getDynamicSeriesConfigData',
  //           functionArguments: {
  //             propertyName: 'id',
  //           },
  //         },
  //         name: {
  //           functionName: 'getDynamicSeriesConfigData',
  //           functionArguments: {
  //             propertyName: 'name',
  //           },
  //         },
  //         type: 'bar',
  //         stackId: 'stack1',
  //         yAxisId: 'axis',
  //         data: {
  //           functionName: 'replaceEmpty',
  //           functionArguments: {
  //             data: {
  //               functionName: 'loadSeries',
  //               functionArguments: {
  //                 sourceType: 'external',
  //                 sourceParameters: {
  //                   functionName: 'getDynamicSeriesConfigData',
  //                   functionArguments: {
  //                     propertyName: 'loadSeriesSourceParameters',
  //                   },
  //                 },
  //               },
  //             },
  //             fallbackValue: 0,
  //           },
  //         },
  //       },
  //     },
  //   }],
  // }]),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasCharts: notEmpty('chartSpecs'),

  /**
   * @type {ComputedProperty<Utils.OneTimeSeriesChart.QueryBatcher>}
   */
  timeSeriesQueryBatcher: computed(function timeSeriesQueryBatcher() {
    return new QueryBatcher({
      fetchData: (batchedQuery) =>
        this.get('getStoreContentCallback')({
          type: 'timeSeriesStoreContentBrowseOptions',
          mode: browseModes.slice,
          layout: batchedQuery.metrics,
          startTimestamp: batchedQuery.startTimestamp,
          windowsCount: batchedQuery.limit,
        }).then(result => result && result.slice),
    });
  }),

  init() {
    this._super(...arguments);
    const timeSeriesGeneratorStateUpdater =
      this.set('timeSeriesGeneratorStateUpdater', Looper.create({
        immediate: true,
        interval: this.get('timeSeriesGeneratorStateReloadInterval'),
      }));
    timeSeriesGeneratorStateUpdater.on('tick', () =>
      this.updateTimeSeriesGeneratorsStateProxy({ replace: true })
    );
  },

  willDestroyElement() {
    try {
      this.get('timeSeriesGeneratorStateUpdater').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  async fetchTimeSeriesGeneratorsState() {
    const schemas = this.get('store.config.schemas');
    const state = {};
    schemas.forEach(({ nameGenerator, metrics }) => {
      state[nameGenerator] = {
        timeSeriesNames: [],
        metricIdToResolutionMap: Object.keys(metrics).reduce((acc, metricId) => {
          acc[metricId] = metrics[metricId].resolution;
          return acc;
        }, {}),
        resolutionToMetricIdMap: Object.keys(metrics).reduce((acc, metricId) => {
          acc[metrics[metricId].resolution] = metricId;
          return acc;
        }, {}),
      };
    });

    const layout = await this.fetchTimeSeriesLayout();
    const timeSeriesNames = Object.keys(layout);
    const nameGenerators = schemas.map(({ nameGenerator }) => nameGenerator);
    timeSeriesNames.forEach((timeSeriesName) => {
      for (const nameGenerator of nameGenerators) {
        if (timeSeriesName.startsWith(nameGenerator)) {
          state[nameGenerator].timeSeriesNames.push(timeSeriesName);
        }
      }
    });
    nameGenerators.forEach((nameGenerator) => state[nameGenerator].timeSeriesNames.sort());

    return state;
  },

  async fetchTimeSeriesLayout() {
    const result = await this.get('getStoreContentCallback')({
      type: 'timeSeriesStoreContentBrowseOptions',
      mode: browseModes.layout,
    });
    return result && result.layout;
  },
});
