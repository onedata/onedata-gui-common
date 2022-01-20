import OneHistogramState from './state';
import transformFunctionsIndex from './transform-functions';
import seriesFunctionsIndex from './series-functions';
import seriesFactoriesIndex from './series-factories';
import _ from 'lodash';
import { all as allFulfilled } from 'rsvp';
import moment from 'moment';
import Looper from 'onedata-gui-common/utils/looper';
import { set } from '@ember/object';
import { reconcileTiming } from './series-functions/utils/points';

/**
 * @typedef {Object} OneHistogramConfigurationInitOptions
 * @property {OneHistogramRawConfiguration} rawConfiguration
 * @property {OneHistogramTimeResolutionSpec[]} timeResolutionSpecs
 * @property {OneHistogramExternalDataSources} externalDataSources
 * @property {number} [nowTimestampOffset]
 */

/**
 * @typedef {Object} OneHistogramRawConfiguration
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
 * @typedef {Object} OneHistogramRawSeriesFactory
 * @property {string} factoryName
 * @property {Object} factoryArguments
 */

/**
 * @typedef {Object} OneHistogramRawSeries
 * @property {string} id
 * @property {string} name
 * @property {OneHistogramChartType} type
 * @property {string} yAxisId
 * @property {string} [color]
 * @property {string} [stackId]
 * @property {OneHistogramRawFunction} data
 */

/**
 * @typedef {Object} OneHistogramRawFunction
 * @property {string} functionName
 * @property {Object} functionArguments
 */

/**
 * @typedef {OneHistogramSeriesFunctionPointsResult|OneHistogramSeriesFunctionBasicResult<T>} OneHistogramSeriesFunctionGenericResult<T>
 */

/**
 * @typedef {Object} OneHistogramSeriesFunctionPointsResult
 * @property {'points'} type
 * @property {Array<OneHistogramSeriesPoint>} data
 */

/**
 * @typedef {Object} OneHistogramSeriesFunctionBasicResult<T>
 * @property {'basic'} type
 * @property {T} data
 */

/**
 * @typedef {'bar'|'line'} OneHistogramChartType
 */

/**
 * @typedef {Object} OneHistogramTimeResolutionSpec
 * @property {number} timeResolution
 * @property {number} windowsCount
 * @property {number} updateInterval
 */

/**
 * @typedef {Object<string,OneHistogramExternalDataSource>} OneHistogramExternalDataSources
 */

/**
 * @typedef {Object} OneHistogramExternalDataSource
 * @property {(seriesParameters: OneHistogramDataSourceFetchParams, sourceParameters: Object) => Promise<unknown>} fetchSeries
 * @property {(sourceParameters: Object) => Promise<unknown[]>} fetchDynamicSeriesConfigs
 */

/**
 * @typedef {Object} OneHistogramDataSourceFetchParams
 * @property {number} lastWindowTimestamp
 * @property {number} timeResolution
 * @property {number} windowsCount
 */

/**
 * @typedef {Object} OneHistogramSeriesContext
 * @property {OneHistogramExternalDataSources} externalDataSources
 * @property {number} nowTimestamp
 * @property {number} lastWindowTimestamp
 * @property {number} timeResolution
 * @property {number} windowsCount
 */

/**
 * @typedef {OneHistogramSeriesContext} OneHistogramSeriesFactoryContext
 * @property {(context: OneHistogramSeriesFunctionContext, seriesTemplate: OneHistogramRawSeries) => Promise<OneHistogramSeries>} evaluateSeries
 */

/**
 * @typedef {OneHistogramSeriesContext} OneHistogramSeriesFunctionContext
 * @property {(context: OneHistogramSeriesFunctionContext, seriesFunction: OneHistogramRawFunction) => Promise<OneHistogramSeriesPoint[]>} evaluateSeriesFunction
 * @property {(context: OneHistogramTransformFunctionContext, transformFunction: OneHistogramRawFunction) => unknown} evaluateTransformFunction
 */

/**
 * @typedef {Object} OneHistogramTransformFunctionContext
 * @property {(context: OneHistogramTransformFunctionContext, transformFunction: OneHistogramRawFunction) => unknown} evaluateTransformFunction
 */

/**
 * @typedef {(configuration: OneHistogramConfiguration) => void} OneHistogramStateChangeHandler
 */

/**
 * @typedef {Object} OneHistogramViewParameters
 * @property {boolean} [live]
 * @property {number} [lastWindowTimestamp]
 * @property {number} [timeResolution]
 */

const colorRegexp = /^#[0-9a-f]{3}([0-9a-f]([0-9a-f]{2}([0-9a-f]{2})?)?)?$/i;

export default class OneHistogramConfiguration {
  /**
   * @public
   * @param {OneHistogramConfigurationInitOptions} options
   */
  constructor(options) {
    /**
     * @public
     * @readonly
     * @type {OneHistogramTimeResolutionSpec[]}
     */
    this.timeResolutionSpecs = options.timeResolutionSpecs ?
      options.timeResolutionSpecs.sortBy('timeResolution') : [];

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
     * @type {number}
     */
    this.nowTimestampOffset = options.nowTimestampOffset || 0;

    /**
     * @private
     * @type {Set<OneHistogramStateChangeHandler>}
     */
    this.stateChangeHandlers = new Set();

    /**
     * @private
     * @type {boolean}
     */
    this.live = false;

    /**
     * @private
     * @type {number|null}
     */
    this.lastWindowTimestamp = null;

    /**
     * @private
     * @type {number}
     */
    this.timeResolution = null;

    /**
     * @private
     * @type {number}
     */
    this.windowsCount = null;

    /**
     * @private
     * @type {number}
     */
    this.updateInterval = null;

    /**
     * Significant only in non-live mode. In live mode current time is the newest
     * timestamp.
     * @private
     * @type {number|null}
     */
    this.newestWindowTimestamp = null;

    /**
     * @private
     * @type {Utils.Looper}
     */
    this.updater = new Looper({
      immediate: false,
    });
    this.updater.on('tick', () => {
      if (this.live) {
        this.notifyStateChange();
      }
    });

    if (this.timeResolutionSpecs[0]) {
      this.changeTimeResolution(this.timeResolutionSpecs[0].timeResolution);
    }
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
    if (parameters.live !== undefined) {
      this.live = parameters.live;
    }
    if (parameters.timeResolution) {
      this.changeTimeResolution(parameters.timeResolution);
    }
    if (parameters.lastWindowTimestamp !== undefined) {
      if (this.live) {
        const nowTimestamp = this.getNowTimestamp();
        const givenTimestampIsNow = typeof parameters.lastWindowTimestamp !== 'number' ||
          parameters.lastWindowTimestamp >= nowTimestamp - (nowTimestamp % this.timeResolution);
        this.lastWindowTimestamp = givenTimestampIsNow ?
          null : parameters.lastWindowTimestamp;
      } else {
        if (typeof this.newestWindowTimestamp === 'number') {
          this.lastWindowTimestamp = typeof parameters.lastWindowTimestamp === 'number' ?
            Math.min(this.newestWindowTimestamp, parameters.lastWindowTimestamp) : this.newestWindowTimestamp;
        } else {
          this.lastWindowTimestamp = typeof parameters.lastWindowTimestamp === 'number' ?
            parameters.lastWindowTimestamp : null;
        }
      }
    }
    this.notifyStateChange();
  }

  /**
   * @public
   * @returns {Promise<OneHistogramState>}
   */
  async getNewestState() {
    const series = await this.getAllSeriesState();
    if (!this.live && !this.newestWindowTimestamp) {
      let seriesWithNewestTimestamp = series;
      const smallestTimeResolution =
        this.timeResolutionSpecs.sortBy('timeResolution')[0].timeResolution;
      if (
        this.lastWindowTimestamp ||
        this.timeResolution !== smallestTimeResolution ||
        !this.windowsCount
      ) {
        seriesWithNewestTimestamp = await this.getAllSeriesState({
          lastWindowTimestamp: null,
          timeResolution: smallestTimeResolution,
          windowsCount: 1,
        });
      }
      this.acquireNewestWindowTimestamp(seriesWithNewestTimestamp);
    }

    if (this.newestWindowTimestamp && series[0].data.length) {
      for (const singleSeries of series) {
        for (let i = singleSeries.data.length - 1; i >= 0; i--) {
          if (singleSeries.data[i].timestamp < this.newestWindowTimestamp) {
            break;
          }
          singleSeries.data[i].newest = true;
        }
      }
    }

    return new OneHistogramState({
      title: this.rawConfiguration.title,
      yAxes: this.getYAxesState(),
      xAxis: this.getXAxisState(series),
      series,
      timeResolution: this.timeResolution,
      windowsCount: this.windowsCount,
      newestWindowTimestamp: this.newestWindowTimestamp,
    });
  }

  /**
   * @public
   * @returns {void}
   */
  destroy() {
    this.stateChangeHandlers.clear();
    this.updater.destroy();
  }

  async acquireNewestWindowTimestamp(series) {
    this.newestWindowTimestamp = series[0].data.length ?
      series[0].data[series[0].data.length - 1].timestamp : this.getNowTimestamp();
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
      timestampFormatter: (timestamp) => this.formatTimestamp(timestamp),
    };
  }

  /**
   * @private
   * @param {Partial<OneHistogramSeriesContext>} [context]
   * @returns {Promise<OneHistogramSeries[]>}
   */
  async getAllSeriesState(context) {
    const normalizedContext = this.normalizeSeriesContext(context);
    if (!normalizedContext.evaluateSeries) {
      normalizedContext.evaluateSeries = (...args) => this.getSeriesState(...args);
    }
    const seriesPerFactory = await allFulfilled(
      this.rawConfiguration.series.map((seriesFactory) => {
        const factoryFunction = seriesFactoriesIndex[seriesFactory.factoryName];
        if (!factoryFunction) {
          throw {
            id: 'unknownHistogramFactory',
            details: {
              factoryName: seriesFactory.factoryName,
            },
          };
        }
        return factoryFunction(normalizedContext, seriesFactory.factoryArguments);
      })
    );
    const allSeries = _.flatten(seriesPerFactory);
    reconcileTiming(allSeries.mapBy('data'));
    return allSeries;
  }

  /**
   * @param {Partial<OneHistogramSeriesContext>|null} context
   * @param {OneHistogramRawSeries} series
   * @returns {Promise<OneHistogramSeries>}
   */
  async getSeriesState(context, series) {
    const [
      { data: id },
      { data: name },
      { data: color },
      data,
    ] = await allFulfilled(['id', 'name', 'color', 'data'].map(propName =>
      this.evaluateSeriesFunction(context, series[propName])
    ));
    const normalizedData = data.type === 'points' ? data.data : [];
    return {
      id,
      name,
      type: series.type,
      yAxisId: series.yAxisId,
      color: this.normalizeColor(color),
      stackId: series.stackId,
      data: normalizedData,
    };
  }

  /**
   * @param {Partial<OneHistogramTransformFunctionContext>|null} context
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
   * @param {Partial<OneHistogramSeriesFunctionContext>|null} context
   * @param {OneHistogramRawFunction} seriesFunction
   * @returns {Promise<OneHistogramSeriesPoint[]>}
   */
  async evaluateSeriesFunction(context, seriesFunction) {
    if (!isRawFunction(seriesFunction)) {
      // When `seriesFunction` isn't a function definition, then it is
      // probably a constant value
      return {
        type: 'basic',
        data: seriesFunction,
      };
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
    if (!normalizedContext.nowTimestamp) {
      normalizedContext.nowTimestamp = this.getNowTimestamp();
    }
    if (!('lastWindowTimestamp' in normalizedContext)) {
      if (this.live && !this.lastWindowTimestamp) {
        normalizedContext.lastWindowTimestamp = normalizedContext.nowTimestamp;
      } else {
        normalizedContext.lastWindowTimestamp = this.lastWindowTimestamp;
      }
    }
    if (typeof normalizedContext.timeResolution !== 'number') {
      normalizedContext.timeResolution = this.timeResolution;
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
   * @param {number} timestamp
   * @returns {string}
   */
  formatTimestamp(timestamp) {
    let dateFormat;
    if (this.timeResolution < 60) {
      dateFormat = 'H:mm:ss[\n]DD/MM/YYYY';
    } else if (this.timeResolution < 24 * 60 * 60) {
      dateFormat = 'H:mm[\n]DD/MM/YYYY';
    } else if (this.timeResolution >= 24 * 60 * 60) {
      dateFormat = 'DD/MM/YYYY';
    } else {
      return '';
    }
    return moment.unix(timestamp).format(dateFormat);
  }

  /**
   * @private
   * @param {OneHistogramStateChangeHandler} handler
   * @returns {void}
   */
  notifyStateChange() {
    this.stateChangeHandlers.forEach(callback => callback(this));
  }

  /**
   * @private
   * @param {number} timeResolution
   * @returns {void}
   */
  changeTimeResolution(timeResolution) {
    if (this.timeResolution === timeResolution) {
      return;
    }
    const timeResolutionSpec =
      this.timeResolutionSpecs.findBy('timeResolution', timeResolution);
    if (!timeResolutionSpec) {
      return;
    }

    this.timeResolution = timeResolutionSpec.timeResolution;
    this.windowsCount = timeResolutionSpec.windowsCount;
    this.updateInterval = timeResolutionSpec.updateInterval;
    set(this.updater, 'interval', this.updateInterval * 1000);
  }

  /**
   * @private
   * @returns {number}
   */
  getNowTimestamp() {
    return Math.floor(Date.now() / 1000) + this.nowTimestampOffset;
  }

  /**
   * @private
   * @param {unknown} context
   * @returns {OneHistogramSeriesContext}
   */
  normalizeSeriesContext(context) {
    const normalizedContext = context ? Object.assign({}, context) : {};
    if (!normalizedContext.externalDataSources) {
      normalizedContext.externalDataSources = this.externalDataSources;
    }
    if (!normalizedContext.nowTimestamp) {
      normalizedContext.nowTimestamp = this.getNowTimestamp();
    }
    if (!('lastWindowTimestamp' in normalizedContext)) {
      if (this.live && !this.lastWindowTimestamp) {
        normalizedContext.lastWindowTimestamp = normalizedContext.nowTimestamp;
      } else {
        normalizedContext.lastWindowTimestamp = this.lastWindowTimestamp;
      }
    }
    if (typeof normalizedContext.timeResolution !== 'number') {
      normalizedContext.timeResolution = this.timeResolution;
    }
    if (typeof normalizedContext.windowsCount !== 'number') {
      normalizedContext.windowsCount = this.windowsCount;
    }
    return normalizedContext;
  }

  /**
   * @private
   * @param {unknown} color
   * @return {string|null}
   */
  normalizeColor(color) {
    return (typeof color === 'string' && colorRegexp.test(color)) ? color : null;
  }
}

function isRawFunction(rawFunction) {
  return rawFunction && typeof rawFunction.functionName === 'string';
}
