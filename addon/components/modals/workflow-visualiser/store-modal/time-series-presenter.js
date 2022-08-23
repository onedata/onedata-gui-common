/**
 * Shows time series store content using charts. To be fully functional presented
 * store must have non-empty `dashboardSpec` property.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get, set } from '@ember/object';
import { reads } from '@ember/object/computed';
import layout from '../../../../templates/components/modals/workflow-visualiser/store-modal/time-series-presenter';
import { browseModes } from 'onedata-gui-common/utils/atm-workflow/store-content-browse-options/time-series';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import Looper from 'onedata-gui-common/utils/looper';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

const mixins = [
  I18n,
  createDataProxyMixin('tsNamesPerGenerator'),
];

export default Component.extend(...mixins, {
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
  tsNamesPerGeneratorReloadInterval: 5000,

  /**
   * @type {Utils.Looper}
   */
  tsNamesPerGeneratorUpdater: undefined,

  /**
   * @type {ComputedProperty<Array<AtmTimeSeriesSchema>>}
   */
  timeSeriesSchemas: reads('store.config.timeSeriesCollectionSchema.timeSeriesSchemas'),

  /**
   * @type {ComputedProperty<OneTimeSeriesChartsSectionSpec>}
   */
  rootChartsSection: reads('store.config.dashboardSpec.rootSection'),

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

  /**
   * @type {ComputedProperty<({ dataSourceName: string, batchedQuery: BatchedTimeSeriesQuery }) => Promise<BatchedTimeSeriesQueryResult>>}
   */
  queryBatcherFetchDataCallback: computed(function queryBatcherFetchDataCallback() {
    return this.onQueryBatcherFetchData.bind(this);
  }),

  tsNamesPerGeneratorUpdaterToggler: observer(
    'store.contentMayChange',
    function tsNamesPerGeneratorUpdaterToggler() {
      const contentMayChange = this.get('store.contentMayChange');
      const {
        tsNamesPerGeneratorUpdater,
        tsNamesPerGeneratorReloadInterval,
      } = this.getProperties(
        'tsNamesPerGeneratorUpdater',
        'tsNamesPerGeneratorReloadInterval'
      );
      const updaterIsActive = Boolean(
        get(tsNamesPerGeneratorUpdater, 'interval')
      );
      if (contentMayChange && !updaterIsActive) {
        set(
          tsNamesPerGeneratorUpdater,
          'interval',
          tsNamesPerGeneratorReloadInterval
        );
      } else if (!contentMayChange && updaterIsActive) {
        tsNamesPerGeneratorUpdater.stop();
        this.updateTsNamesPerGeneratorProxy();
      }
    }
  ),

  /**
   * @override
   */
  init() {
    this._super(...arguments);
    const tsNamesPerGeneratorUpdater =
      this.set('tsNamesPerGeneratorUpdater', Looper.create({
        immediate: true,
      }));
    tsNamesPerGeneratorUpdater.on('tick', () =>
      this.updateTsNamesPerGeneratorProxy({ replace: true })
    );
    this.tsNamesPerGeneratorUpdaterToggler();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.get('tsNamesPerGeneratorUpdater').destroy();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * @param {{ batchedQuery: BatchedTimeSeriesQuery }} params
   * @returns {Promise<BatchedTimeSeriesQueryResult>}
   */
  async onQueryBatcherFetchData({ batchedQuery }) {
    const result = await this.getStoreContent({
      type: 'timeSeriesStoreContentBrowseOptions',
      mode: browseModes.slice,
      layout: batchedQuery.metrics,
      startTimestamp: batchedQuery.startTimestamp,
      windowsCount: batchedQuery.limit,
    });
    return result?.slice;
  },

  /**
   * @param {{ timeSeriesNameGenerator: string, metricNames: Array<string> }} sourceParameters
   * @returns {Promise<Array<{ id: string, name: string, loadSeriesSourceSpec: OTSCExternalDataSourceRefParameters }>>}
   */
  async fetchDynamicSeriesConfigs(sourceParameters) {
    const {
      timeSeriesNameGenerator,
      metricNames,
    } = (sourceParameters || {});
    if (!timeSeriesNameGenerator || !Array.isArray(metricNames)) {
      return [];
    }
    const tsNamesPerGenerator =
      await this.get('tsNamesPerGeneratorProxy');
    const timeSeriesNames = tsNamesPerGenerator[timeSeriesNameGenerator] || [];
    return timeSeriesNames.map((timeSeriesName) => ({
      id: timeSeriesName,
      name: timeSeriesName,
      loadSeriesSourceSpec: {
        externalSourceName: 'store',
        externalSourceParameters: {
          timeSeriesNameGenerator,
          timeSeriesName,
          metricNames,
        },
      },
    }));
  },

  /**
   * Returns mapping (time series name generator) -> (array of time series names)
   * @returns {Object<string, Array<string>>}
   */
  async fetchTsNamesPerGenerator() {
    const layout = await this.fetchTimeSeriesLayout();
    const timeSeriesNames = Object.keys(layout);
    const nameGenerators = this.get('timeSeriesSchemas')
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
   * @returns {Promise<AtmTimeSeriesStoreLayoutContentBrowseResult['layout']>}
   */
  async fetchTimeSeriesLayout() {
    const result = await this.getStoreContent({
      type: 'timeSeriesStoreContentBrowseOptions',
      mode: browseModes.layout,
    });
    return result?.layout;
  },

  /**
   * @param {AtmStoreContentBrowseOptions} browseOptions
   * @returns {Promise<AtmStoreContentBrowseResult|null>}
   */
  async getStoreContent(browseOptions) {
    return this.get('getStoreContentCallback')?.(browseOptions) || null;
  },
});
