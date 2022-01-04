import OneHistogramState from './state';
import valueFormattersIndex from './value-formatters';
import dataFunctionsIndex from './data-functions';
import _ from 'lodash';
import { all as allFulfilled } from 'rsvp';

/**
 * @typedef {Object} OneHistogramConfigurationInitOptions
 * @property {OneHistogramRawConfiguration} rawConfiguration
 * @property {OneHistogramExternalDataSources} externalDataSources
 */

/**
 * @typedef {Object} OneHistogramRawConfiguration
 * @property {string} id
 * @property {string} title
 * @property {OneHistogramRawYAxis[]} yAxes
 * @property {OneHistogramRawSeriesFactory[]} series
 */

/**
 * @typedef {Object} OneHistogramRawYAxis
 * @property {string} id
 * @property {string} name
 * @property {OneHistogramRawFormatter} valueFormatter
 */

/**
 * @typedef {Object} OneHistogramRawFormatter
 * @property {string} functionName
 * @property {Object} functionArguments
 */

/**
 * @typedef {OneHistogramRawStaticSeriesFactory} OneHistogramRawSeriesFactory
 */

/**
 * @typedef {Object} OneHistogramRawStaticSeriesFactory
 * @property {'static'} factoryName
 * @property {OneHistogramRawStaticSeriesFactoryArguments} factoryArguments
 */

/**
 * @typedef {Object} OneHistogramRawStaticSeriesFactoryArguments
 * @property {OneHistogramRawSeries} seriesTemplate
 */

/**
 * @typedef {Object} OneHistogramRawSeries
 * @property {string} id
 * @property {string} name
 * @property {OneHistogramChartType} type
 * @property {string} yAxisId
 * @property {string|undefined} stackId
 * @property {OneHistogramRawDataFunction} data
 */

/**
 * @typedef {Object} OneHistogramRawDataFunction
 * @property {string} functionName
 * @property {Object} functionArguments
 */

/**
 * @typedef {'bar'|'line'} OneHistogramChartType
 */

/**
 * @typedef {Object<string,OneHistogramExternalDataSource>} OneHistogramExternalDataSources
 */

/**
 * @typedef {Object} OneHistogramExternalDataSource
 * @property {(seriesParameters: OneHistogramDataSourceFetchParams, sourceParameters: Object) => Promise<unknown>} fetchData
 * @property {OneHistogramReloadTimePerWindow} [reloadTime]
 */

/**
 * @typedef {Object} OneHistogramDataSourceFetchParams
 * @property {number} startTimestamp
 * @property {number} endTimestamp
 */

/**
 * @typedef {Object} OneHistogramReloadTimePerWindow
 * @property {number} second
 * @property {number} minute
 * @property {number} hour
 * @property {number} day
 */

/**
 * @typedef {Object} OneHistogramDataFunctionContext
 * @property {OneHistogramExternalDataSources} externalDataSources
 * @property {(dataFunction: OneHistogramRawDataFunction, context: OneHistogramDataFunctionContext) => Promise<OneHistogramSeriesPoint[]>} evaluateDataFunction
 * @property {number} startTimestamp
 * @property {number} endTimestamp
 */

/**
 * @typedef {(configuration: OneHistogramConfiguration) => void} OneHistogramStateChangeHandler
 */

/**
 * @typedef {Object} OneHistogramViewParameters
 * @property {number} startTimestamp
 * @property {number} endTimestamp
 */

export default class OneHistogramConfiguration {
  /**
   * @public
   * @param {OneHistogramConfigurationInitOptions} options
   */
  constructor(options) {
    /**
     * @private
     * @type {OneHistogramRawConfiguration}
     */
    this.rawConfiguration = options.rawConfiguration;

    /**
     * @private
     * @type {OneHistogramExternalDataSources}
     */
    this.externalDataSources = options.externalDataSources;

    /**
     * @private
     * @type {Set<OneHistogramStateChangeHandler>}
     */
    this.stateChangeHandlers = new Set();

    /**
     * @private
     * @type {number|null}
     */
    this.startTimestamp = null;

    /**
     * @private
     * @type {number|null}
     */
    this.endTimestamp = null;
  }

  /**
   * @public
   * @param {OneHistogramStateChangeHandler} handler
   * @returns {void}
   */
  registerStateChangeHandler(handler) {
    this.stateChangeHandlers.add(handler);
  }

  /**
   * @public
   * @param {OneHistogramStateChangeHandler} handler
   * @returns {void}
   */
  deregisterStateChangeHandler(handler) {
    this.stateChangeHandlers.delete(handler);
  }

  /**
   * @public
   * @param {OneHistogramViewParameters} parameters
   * @returns {void}
   */
  setViewParameters(parameters) {
    this.startTimestamp = parameters.startTimestamp;
    this.endTimestamp = parameters.endTimestamp;
    this.notifyStateChange();
  }

  /**
   * @public
   * @returns {Promise<OneHistogramState>}
   */
  async getNewestState() {
    const series = await this.getAllSeriesState();
    return new OneHistogramState({
      id: this.rawConfiguration.id,
      title: this.rawConfiguration.title,
      yAxes: this.getYAxesState(),
      xAxis: this.getXAxisState(series),
      series,
    });
  }

  /**
   * @public
   * @returns {void}
   */
  destroy() {
    this.stateChangeHandlers.clear();
  }

  /**
   * @private
   * @returns {OneHistogramYAxisConfiguration[]}
   */
  getYAxesState() {
    return this.rawConfiguration.yAxes.map((rawYAxis) => {
      const valueFormatterFunction =
        valueFormattersIndex[rawYAxis.valueFormatter.functionName] ||
        valueFormattersIndex.default;
      return {
        id: rawYAxis.id,
        name: rawYAxis.name,
        valueFormatter: {
          function: valueFormatterFunction,
          functionArguments: rawYAxis.valueFormatter.functionArguments,
        },
      };
    });
  }

  /**
   * @private
   * @returns {OneHistogramXAxisConfiguration}
   */
  getXAxisState(seriesState) {
    const timestamps = seriesState.length ? seriesState[0].data.mapBy('timestamp') : [];
    return {
      name: 'Time',
      timestamps,
    };
  }

  /**
   * @private
   * @returns {Promise<OneHistogramSeries[]>}
   */
  async getAllSeriesState() {
    const seriesPerFactory = await allFulfilled(
      this.rawConfiguration.series.map((seriesFactory) =>
        this.getSeriesStateUsingFactory(seriesFactory)
      )
    );
    return _.flatten(seriesPerFactory);
  }

  /**
   * @param {OneHistogramRawSeriesFactory} seriesFactory
   * @returns {Promise<OneHistogramSeries[]>}
   */
  async getSeriesStateUsingFactory(seriesFactory) {
    switch (seriesFactory.factoryName) {
      case 'static':
        return this.getSeriesStateUsingStaticFactory(seriesFactory.factoryArguments);
      default:
        return [];
    }
  }

  /**
   * @param {OneHistogramRawStaticSeriesFactoryArguments} factoryArguments
   * @returns {Promise<OneHistogramSeries[]>}
   */
  async getSeriesStateUsingStaticFactory(factoryArguments) {
    return await this.getSeriesState(factoryArguments.seriesTemplate);
  }

  /**
   * @param {OneHistogramRawSeries} factoryArguments
   * @returns {Promise<OneHistogramSeries>}
   */
  async getSeriesState(series) {
    const data = await this.evaluateSeriesDataFunction(series.data);
    return {
      id: series.id,
      name: series.name,
      type: series.type,
      yAxisId: series.yAxisId,
      stackId: series.stackId,
      data,
    };
  }

  /**
   * @param {OneHistogramRawDataFunction} dataFunction
   * @param {OneHistogramDataFunctionContext} context
   * @returns {Promise<OneHistogramSeriesPoint[]>}
   */
  async evaluateSeriesDataFunction(dataFunction, context) {
    const normalizedContext = context || {
      externalDataSources: this.externalDataSources,
      evaluateDataFunction: (...args) => this.evaluateSeriesDataFunction(...args),
      startTimestamp: this.startTimestamp,
      endTimestamp: this.endTimestamp,
    };
    const dataFunctionCallback =
      dataFunctionsIndex[dataFunction.functionName] ||
      dataFunctionsIndex.default;
    return await dataFunctionCallback(
      normalizedContext,
      dataFunction.functionArguments
    );
  }

  /**
   * @private
   * @param {OneHistogramStateChangeHandler} handler
   * @returns {void}
   */
  notifyStateChange() {
    this.stateChangeHandlers.forEach(callback => callback(this));
  }
}
