/**
 * Shows preview of the chart. Uses random data to visualize series provided by
 * user in the editor.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import layout from 'onedata-gui-common/templates/components/atm-workflow/charts-dashboard-editor/chart-preview';
import QueryBatcher from 'onedata-gui-common/utils/one-time-series-chart/query-batcher';
import OTSCConfiguration from 'onedata-gui-common/utils/one-time-series-chart/configuration';
import OTSCModel from 'onedata-gui-common/utils/one-time-series-chart/model';
import { DefaultCallbacks } from 'onedata-gui-common/components/one-time-series-charts-section';
import HashGenerator from 'onedata-gui-common/utils/hash-generator';

export default Component.extend({
  layout,
  classNames: ['chart-preview'],

  /**
   * @virtual
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  chart: undefined,

  /**
   * Contains latest value of `chart`. Used to handle listeners deregistration
   * when injected `chart` changes.
   * @type {Utils.AtmWorkflow.ChartsDashboardEditor.Chart}
   */
  currentChart: undefined,

  /**
   * Query batcher responsible for generating fake time series data.
   * @type {Utils.OneTimeSeriesChart.QueryBatcher}
   */
  fakeQueryBatcher: undefined,

  /**
   * Callbacks used normally by OneTimeSeriesChartsSection to provide
   * default functionality of charts API. These are useful here as are good
   * enough for handling preview chart.
   * @type {Components.OneTimeSeriesChartsSection.DefaultCallbacks}
   */
  defaultChartCallbacks: undefined,

  /**
   * @type {Utils.OneTimeSeriesChart.Model | null}
   */
  chartModel: undefined,

  /**
   * Used to generate the same pseudo-random chart data for the same queries.
   * @type {Util.HashGenerator}
   */
  hashGenerator: undefined,

  /**
   * @type {ComputedProperty<() => void>}
   */
  chartChangeListener: computed(function chartChangeListener() {
    return () => debounce(
      this,
      'handleChartChange',
      config.environment === 'test' ? 1 : 500
    );
  }),

  /**
   * @override
   */
  init() {
    this._super(...arguments);

    const fakeQueryBatcher = new QueryBatcher({
      fetchData: (batchedQuery) => this.generateFakeResponseForQuery(batchedQuery),
    });
    this.setProperties({
      currentChart: this.chart,
      fakeQueryBatcher,
      defaultChartCallbacks: new DefaultCallbacks({
        queryBatchers: {
          store: fakeQueryBatcher,
        },
        onGetTimeSeriesSchemas: (collectionRef) =>
          this.getTimeSeriesSchemas(collectionRef),
      }),
      hashGenerator: new HashGenerator(),
    });

    this.attachChartChangeListener(this.chart);
    this.handleChartChange();
  },

  /**
   * @override
   */
  didUpdateAttrs() {
    this._super(...arguments);

    if (this.chart !== this.currentChart) {
      this.detachChartChangeListener(this.currentChart);
      this.attachChartChangeListener(this.chart);
      this.set('currentChart', this.chart);
    }
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.detachChartChangeListener(this.currentChart);
      this.fakeQueryBatcher.destroy();
      this.chartModel?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Chart} chart
   * @returns {void}
   */
  attachChartChangeListener(chart) {
    chart.addChangeListener(this.chartChangeListener);
  },

  /**
   * @param {Utils.AtmWorkflow.ChartsDashboardEditor.Chart} chart
   * @returns {void}
   */
  detachChartChangeListener(chart) {
    chart.removeChangeListener(this.chartChangeListener);
  },

  /**
   * @returns {void}
   */
  async handleChartChange() {
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    this.chartModel?.destroy();

    const chartSpec = this.chart?.toJson();
    if (!chartSpec) {
      this.set('chartModel', null);
      return;
    }

    const configuration = new OTSCConfiguration({
      chartDefinition: chartSpec,
      timeResolutionSpecs: await this.defaultChartCallbacks
        .onGetTimeResolutionSpecs({ chartDefinition: chartSpec }),
      externalDataSources: {
        store: {
          fetchSeries: (...args) =>
            this.defaultChartCallbacks.fetchSeries.store(...args),
          fetchDynamicSeriesConfigs: (...args) =>
            this.getDynamicSeriesConfigs(...args),
        },
      },
    });

    this.set('chartModel', OTSCModel.create({ configuration }));
  },

  /**
   * @param {BatchedTimeSeriesQuery} batchedQuery
   * @returns {BatchedTimeSeriesQueryResult}
   */
  generateFakeResponseForQuery({
    collectionRef,
    layout,
    startTimestamp,
    windowLimit,
  }) {
    const result = {};
    const timeSeriesSchemas = this.getTimeSeriesSchemas(collectionRef);
    const normalizedStartTimestamp = startTimestamp ?? Math.floor(Date.now() / 1000);
    for (const seriesName in layout) {
      const seriesSchemaMetrics = timeSeriesSchemas
        .find(({ nameGenerator }) => seriesName.startsWith(nameGenerator))
        ?.metrics;
      if (!seriesSchemaMetrics) {
        continue;
      }

      for (const metricName of layout[seriesName]) {
        const timeResolution = seriesSchemaMetrics[metricName]?.resolution;
        if (!timeResolution) {
          continue;
        }

        const metricStartTimestamp = normalizedStartTimestamp +
          (timeResolution - normalizedStartTimestamp % timeResolution);
        const points = [];

        for (let pointIdx = 0; pointIdx < windowLimit; pointIdx++) {
          points.push({
            timestamp: metricStartTimestamp - pointIdx * timeResolution,
            // Using a bit complicated value generation to ensure, that for the same
            // series and point in that series there will be always a constant value.
            // It allows to generate previews which are not totally different
            // each time something in the chart changes.
            value: Number.parseInt(this.hashGenerator.getHash(
              `${collectionRef}${seriesName}${metricName}${pointIdx}`
            ), 16) % 5000,
          });
        }

        result[seriesName] ??= {};
        result[seriesName][metricName] = points;
      }
    }

    return result;
  },

  /**
   * @param {string} collectionRef
   * @returns {Array<TimeSeriesSchema>}
   */
  getTimeSeriesSchemas(collectionRef) {
    return this.chart.dataSources
      .find(({ collectionRef: ref }) => ref === collectionRef)
      ?.timeSeriesCollectionSchema.timeSeriesSchemas ?? [];
  },

  /**
   * Generates fake dynamic series configs - assumes, that for each dynamic series
   * (prefix_) there are two real series somePrefix_example0 and somePrefix_example1.
   * @param {{ collectionRef: string, timeSeriesNameGenerator: string, metricNames: Array<string> }} sourceParameters
   * @returns {Array<{ id: string, name: string, loadSeriesSourceSpec: OTSCExternalDataSourceRefParameters }>}
   */
  getDynamicSeriesConfigs(sourceParameters) {
    const {
      collectionRef,
      timeSeriesNameGenerator,
      metricNames,
    } = sourceParameters;
    return [0, 1].map((idx) => {
      const timeSeriesName = `${timeSeriesNameGenerator}example${idx}`;
      return {
        id: `${collectionRef}-${timeSeriesName}`,
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
      };
    });
  },
});
