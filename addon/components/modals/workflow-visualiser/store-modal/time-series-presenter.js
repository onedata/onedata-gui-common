/**
 * Shows time series store content using charts. To be fully functional presented
 * store must have non-empty `chartSpecs` property.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get, set } from '@ember/object';
import { reads, notEmpty } from '@ember/object/computed';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/time-series-presenter';
import QueryBatcher from 'onedata-gui-common/utils/one-time-series-chart/query-batcher';
import { browseModes } from 'onedata-gui-common/utils/atm-workflow/store-content-browse-options/time-series';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import Looper from 'onedata-gui-common/utils/looper';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

/**
 * @typedef {Object<string, TimeSeriesStoreGeneratorState>} TimeSeriesStoreGeneratorsState
 * Keys are generator names
 */

/**
 * @typedef {Object} TimeSeriesStoreGeneratorState
 * @property {Array<string>} timeSeriesNames
 * @property {Object<string, number>} metricIdToResolutionMap
 * @property {Object<number, string>} resolutionToMetricIdMap
 */

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
  timeSeriesGeneratorsStateReloadInterval: 5000,

  /**
   * @type {Utils.Looper}
   */
  timeSeriesGeneratorsStateUpdater: undefined,

  /**
   * @type {ComputedProperty<Array<OTSCChartDefinition>>}
   */
  chartSpecs: reads('store.config.chartSpecs'),

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
        this.getStoreContent({
          type: 'timeSeriesStoreContentBrowseOptions',
          mode: browseModes.slice,
          layout: batchedQuery.metrics,
          startTimestamp: batchedQuery.startTimestamp,
          windowsCount: batchedQuery.limit,
        }).then(result => result && result.slice),
    });
  }),

  timeSeriesGeneratorsStateUpdaterController: observer(
    'store.contentMayChange',
    function timeSeriesGeneratorsStateUpdaterController() {
      const contentMayChange = this.get('store.contentMayChange');
      const {
        timeSeriesGeneratorsStateUpdater,
        timeSeriesGeneratorsStateReloadInterval,
      } = this.getProperties(
        'timeSeriesGeneratorsStateUpdater',
        'timeSeriesGeneratorsStateReloadInterval'
      );
      const updaterIsActive = Boolean(
        get(timeSeriesGeneratorsStateUpdater, 'interval')
      );
      if (contentMayChange && !updaterIsActive) {
        set(
          timeSeriesGeneratorsStateUpdater,
          'interval',
          timeSeriesGeneratorsStateReloadInterval
        );
      } else if (!contentMayChange && updaterIsActive) {
        timeSeriesGeneratorsStateUpdater.notify();
        timeSeriesGeneratorsStateUpdater.stop();
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    const timeSeriesGeneratorsStateUpdater =
      this.set('timeSeriesGeneratorsStateUpdater', Looper.create({
        immediate: true,
      }));
    timeSeriesGeneratorsStateUpdater.on('tick', () =>
      this.updateTimeSeriesGeneratorsStateProxy({ replace: true })
    );
    this.timeSeriesGeneratorsStateUpdaterController();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.get('timeSeriesGeneratorsStateUpdater').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @override
   */
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
    nameGenerators.forEach((nameGenerator) =>
      state[nameGenerator].timeSeriesNames.sort()
    );

    return state;
  },

  /**
   * @returns {Promise<AtmTimeSeriesStoreLayoutContentBrowseResult['layout']>}
   */
  async fetchTimeSeriesLayout() {
    const result = await this.getStoreContent({
      type: 'timeSeriesStoreContentBrowseOptions',
      mode: browseModes.layout,
    });
    return result && result.layout;
  },

  /**
   * @param {AtmStoreContentBrowseOptions} browseOptions
   * @returns {Promise<AtmStoreContentBrowseResult|null>}
   */
  async getStoreContent(browseOptions) {
    const getStoreContentCallback = this.get('getStoreContentCallback');
    return getStoreContentCallback ?
      getStoreContentCallback(browseOptions) : null;
  },
});
