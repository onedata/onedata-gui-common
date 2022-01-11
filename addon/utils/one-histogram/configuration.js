import OneHistogramState from './state';
import transformFunctionsIndex from './transform-functions';
import seriesFunctionsIndex from './series-functions';
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
 * @property {OneHistogramRawFunction} data
 */

/**
 * @typedef {Object} OneHistogramRawFunction
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
 * @property {number} lastWindowTimestamp
 * @property {number} windowTimeSpan
 * @property {number} windowsCount
 */

/**
 * @typedef {Object} OneHistogramReloadTimePerWindow
 * @property {number} second
 * @property {number} minute
 * @property {number} hour
 * @property {number} day
 */

/**
 * @typedef {Object} OneHistogramSeriesFunctionContext
 * @property {OneHistogramExternalDataSources} externalDataSources
 * @property {(context: OneHistogramSeriesFunctionContext, seriesFunction: OneHistogramRawFunction) => Promise<OneHistogramSeriesPoint[]>} evaluateSeriesFunction
 * @property {(context: OneHistogramTransformFunctionContext, transformFunction: OneHistogramRawFunction) => unknown} evaluateTransformFunction
 * @property {number} lastWindowTimestamp
 * @property {number} windowTimeSpan
 * @property {number} windowsCount
 */

/**
 * @typedef {Object} OneHistogramTransformFunctionContext
 * @property {unknown} valueToSupply
 * @property {(context: OneHistogramTransformFunctionContext, transformFunction: OneHistogramRawFunction) => unknown} evaluateTransformFunction
 */

/**
 * @typedef {(configuration: OneHistogramConfiguration) => void} OneHistogramStateChangeHandler
 */

/**
 * @typedef {Object} OneHistogramViewParameters
 * @property {number} lastWindowTimestamp
 * @property {number} windowTimeSpan
 * @property {number} windowsCount
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
    this.lastWindowTimestamp = null;

    /**
     * @private
     * @type {number}
     */
    this.windowTimeSpan = null;

    /**
     * @private
     * @type {number}
     */
    this.windowTimeSpan = null;

    /**
     * @private
     * @type {number}
     */
    this.windowsCount = null;
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
    this.lastWindowTimestamp = parameters.lastWindowTimestamp;
    this.windowTimeSpan = parameters.windowTimeSpan;
    this.windowsCount = parameters.windowsCount;
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
      const rawValueFormatter = isRawFunction(rawYAxis.valueFormatter) ?
        rawYAxis.valueFormatter : {
          functionName: 'supplyValue',
        };
      const valueFormatter = (value) =>
        this.evaluateTransformFunction({
          valueToSupply: value,
        }, rawValueFormatter);

      return {
        id: rawYAxis.id,
        name: rawYAxis.name,
        valueFormatter,
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
    const data = await this.evaluateSeriesFunction(null, series.data);
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
   * @param {OneHistogramTransformFunctionContext} context
   * @param {OneHistogramRawFunction} transformFunction
   * @returns {unknown}
   */
  evaluateTransformFunction(context, transformFunction) {
    if (!isRawFunction(transformFunction)) {
      // When `transformFunction` isn't a function definition, then it is
      // probably a constant value
      return transformFunction;
    }

    const normalizedContext = context || {};
    if (!normalizedContext.evaluateTransformFunction) {
      normalizedContext.evaluateTransformFunction =
        (...args) => this.evaluateTransformFunction(...args);
    }

    const transformFunctionCallback =
      transformFunctionsIndex[transformFunction.functionName];
    if (!transformFunctionCallback) {
      throw {
        id: 'unknownHistogramFunction',
        details: {
          functionName: transformFunction.functionName,
        },
      };
    }

    return transformFunctionCallback(
      normalizedContext,
      transformFunction.functionArguments
    );
  }

  /**
   * @param {OneHistogramSeriesFunctionContext} context
   * @param {OneHistogramRawFunction} seriesFunction
   * @returns {Promise<OneHistogramSeriesPoint[]>}
   */
  async evaluateSeriesFunction(context, seriesFunction) {
    if (!isRawFunction(seriesFunction)) {
      // When `seriesFunction` isn't a function definition, then it is
      // probably a constant value
      return seriesFunction;
    }

    const normalizedContext = context || {};
    if (!normalizedContext.externalDataSources) {
      normalizedContext.externalDataSources = this.externalDataSources;
    }
    if (!normalizedContext.evaluateSeriesFunction) {
      normalizedContext.evaluateSeriesFunction =
        (...args) => this.evaluateSeriesFunction(...args);
    }
    if (!normalizedContext.evaluateTransformFunction) {
      normalizedContext.evaluateTransformFunction =
        (...args) => this.evaluateTransformFunction(...args);
    }
    if (typeof normalizedContext.lastWindowTimestamp !== 'number') {
      normalizedContext.lastWindowTimestamp = this.lastWindowTimestamp;
    }
    if (typeof normalizedContext.windowTimeSpan !== 'number') {
      normalizedContext.windowTimeSpan = this.windowTimeSpan;
    }
    if (typeof normalizedContext.windowsCount !== 'number') {
      normalizedContext.windowsCount = this.windowsCount;
    }

    const seriesFunctionCallback =
      seriesFunctionsIndex[seriesFunction.functionName];
    if (!seriesFunctionCallback) {
      throw {
        id: 'unknownHistogramFunction',
        details: {
          functionName: seriesFunction.functionName,
        },
      };
    }

    return await seriesFunctionCallback(
      normalizedContext,
      seriesFunction.functionArguments
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

function isRawFunction(rawFunction) {
  return rawFunction && typeof rawFunction.functionName === 'string';
}
