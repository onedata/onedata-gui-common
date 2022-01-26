/**
 * A class, that contains configuration of time series chart.
 *
 * # Main configuration elements
 *
 * Configuration consists of 4 main configuration parts:
 * - raw configuration - contains definitions of axes, series and all settings,
 *   which don't depend on data itself. Is provided during configuration object
 *   creation and cannot be modified.
 * - data sources configuration - contains data sources definitions, which
 *   are mentioned by various elements from raw configuration. Each data source
 *   definition includes callbacks, which provide data like points arrays,
 *   dynamic series configs etc. Is provided during configuration object
 *   creation and cannot be modified.
 * - time resolutions - possible time resolutions which can be rendered by the chart.
 *   These strongly depend on characteristics of data sources (as each data source
 *   can have different set of time resolutions). Are provided during configuration object
 *   creation and cannot be modified.
 * - view parameters - navigation-like properties, that define which part of
 *   the chart is visible. Are provided after configuration object creation and
 *   can be modified during the whole chart life.
 *
 * ## Raw configuration
 *
 * The raw configuration is that part of the configuration, which is constant regardless
 * backend data. It is a pure definition of series and axes - basically all visual
 * settings - and is completely detached from concrete data. It consists of:
 * - title - a string, which should be rendered as a title of the whole chart,
 * - yAxes - an array of Y axes definitions. Usually only one Y axis will be necessary,
 *   but for more complicated usecases it is possible to render more of them and visualise
 *   data from different domains.
 * - series - an array of series definitions which describe from which data and how
 *   points should be rendered.
 *
 * As you can see there is no X axis configuration. Time series charts are always
 * based on time X axis, so there is nothing to configure.
 *
 * ### Y axis definition
 *
 * Each Y axis definition consists of:
 * - id - string id which allows to reference to it later,
 * - name - short human-readable name, that will be rendered as an axis label
 * - valueFormatter - optional specification of a transform function, that should be used
 *   to stringify value from Y axis and make it human-readable. E.g. it may
 *   transform an integer to a size in bytes. This function will also be used
 *   to render information tooltip about series related to this axis.
 *   NOTE: only transform functions are allowed to be used in valueFormatter function
 *   specification. See more in section "Functions types".
 *
 * Example of Y axis definition:
 * ```
 * {
 *   id: 'bytesAxis',
 *   name: 'Bytes',
 *   valueFormatter: {
 *     functionName: 'asBytes',
 *     functionArguments: {
 *       data: {
 *         functionName: 'abs',
 *         functionArguments: {
 *           data: {
 *             functionName: 'supplyValue',
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 * ```
 * Above example specifies Y axis with id "bytesAxis", name "Bytes" and value formatter,
 * which performs `asBytes(abs(value_from_axis))`.
 *
 * As you can see function definitions can be nested (which argument can receive
 * a nested function is specific for each function). There is also a special function,
 * which have to be used in `valueFormatter` definition - `supplyValue` function.
 * It is replaced by the value from the Y axis.
 *
 * ### Series definitions
 *
 * Defining series starts with defining so-called "series factories". Series factory
 * is responsible for generating series definitions. There are two types of factories:
 * - static - creates one series from template,
 * - dynamic - creates many series based on template and data from data source.
 * Static factory is a good choice for series, which are known in advance and are
 * always present. Dynamic factory is handful in situations, when series are generated
 * depending on some backend data and the number of them is not known during the
 * configuration initialization.
 *
 * #### Series template
 *
 * Before we go to the details of each series factory type, we need to get familiar with
 * series template.
 *
 * It is a template, which is used by series factories as a base for new series
 * configurations. In static factory template is copied once as it is, in dynamic factory
 * it is copied multiple times with small changes. Series template consists of:
 * - id - string id which allows to reference to it later,
 * - name - human-readable label for series,
 * - type - one of: `'bar'`, `'line'`
 * - yAxisId - id of the Y axis, which is used to draw points of this series,
 * - color - (optional) string describing color of points (in hex format e.g. `'#ff0000'`),
 * - stackId - (optional) string id, which allows to stack many series. Series with
 *   the same stackId will be stacked on the same stack.
 * - data - spefication of a series function, that calculates points to render.
 *   NOTE: only series functions are allowed to be used in data function specification.
 *   See more in section "Functions types".
 *
 * Example series template:
 * ```
 * {
 *   id: 'bytesSent',
 *   name: 'Sent',
 *   type: 'line',
 *   yAxisId: 'bytesAxis',
 *   color: '#ff0000',
 *   data: {
 *     functionName: 'abs',
 *     functionArguments: {
 *       data: {
 *         functionName: 'loadSeries',
 *         functionArguments: {
 *           sourceType: 'external',
 *           sourceParameters: {
 *             externalSourceName: 'throughputSource',
 *             externalSourceParameters: {
 *               seriesNameId: 'upload',
 *             },
 *           },
 *         },
 *       },
 *     },
 *   }
 * }
 * ```
 *
 * Above example specifies series template, which describes series with id "bytesSent",
 * label "Sent", rendered using red line and based on data from function
 * `abs(loadSeries('external', 'throughputSource', { seriesNameId: 'upload' }))`.
 *
 * #### Static series factory
 *
 * It has only one argument - seriesTemplate. That template will be copied once
 * and returned.
 *
 * Example of a static series factory:
 *
 * ```
 * {
 *   factoryName: 'static',
 *   factoryArguments: {
 *     seriesTemplate: {
 *       id: 'bytesSent',
 *       name: 'Sent',
 *       type: 'line',
 *       yAxisId: 'bytesAxis',
 *       color: '#ff0000',
 *       data: {
 *         functionName: 'abs',
 *         functionArguments: {
 *           data: {
 *             functionName: 'loadSeries',
 *             functionArguments: {
 *               sourceType: 'external',
 *               sourceParameters: {
 *                 externalSourceName: 'throughputSource',
 *                 externalSourceParameters: {
 *                   seriesNameId: 'upload',
 *                 },
 *               },
 *             },
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 * ```
 *
 * #### Dynamic series factory
 *
 * It has two arguments:
 * - seriesTemplate - already described earlier,
 * - dynamicSeriesConfigs - reference to data source that provides array of series
 *   configs.
 * The number of generated series will match the length of the series configs array
 * returned by the data source from `dynamicSeriesConfigs`.
 *
 * Example of a dynamic series factory:
 * ```
 * {
 *   factoryName: 'dynamic',
 *   factoryArguments: {
 *     dynamicSeriesConfigs: {
 *       sourceType: 'external',
 *       sourceParameters: {
 *         externalSourceName: 'mySource',
 *         externalSourceParameters: { ... },
 *       },
 *     },
 *     seriesTemplate: {
 *       id: {
 *         functionName: 'getDynamicSeriesConfigData',
 *         functionArguments: {
 *           propertyName: 'id',
 *         },
 *       },
 *       name: 'series1',
 *       type: 'bar',
 *       yAxisId: 'a1',
 *       data: {
 *         functionName: 'loadSeries',
 *         functionArguments: {
 *           sourceType: 'external',
 *           sourceParameters: {
 *             externalSourceName: 'dummy',
 *           },
 *         },
 *       },
 *     },
 *   },
 * }
 * ```
 *
 * As it is shown by the example, there is a special function `getDynamicSeriesConfigData`,
 * which allows to access series config object. It is especially handful for
 * id, name and color fields.
 *
 * ## Data sources configuration
 *
 * Chart can have multiple data sources, that can be used by different parts of raw
 * configuration. Data sources configuration is an object with keys treated as
 * data source name and objects as values. Each data source object contains one
 * or many different callbacks, which are used to provide chart data. There are two
 * callbacks for now:
 * - fetchSeries - returns array of series points,
 * - fetchDynamicSeriesConfigs - returns array of series configs for dynamic series factory.
 *
 * Example of data source configuration:
 * ```
 * {
 *   mySource: {
 *     fetchSeries: async (context, externalSourceParams) => { ... },
 *     fetchDynamicSeriesConfigs: async (externalSourceParams) => { ... },
 *   }
 * }
 * ```
 * To learn more about arguments passed to these callback see typedefs below.
 *
 * ## Time resolutions
 *
 * It is an array of time resolution specs. Each spec consists of:
 * - timeResolution - time resolution in seconds which means how many seconds
 *   are grouped into a single point,
 * - windowsCount - number of windows (points) which should be rendered in that
 *   particilar resolution,
 * - updateInterval - how often (in seconds) should data be updated.
 *
 * Resolutions specs depend mostly on the specificity of the data sources.
 * Time resolutions array should contain only these specs, that can be handled by
 * every data source.
 *
 * Example of time resolution specs array:
 * ```
 * [{
 *   timeResolution: 5,
 *   windowsCount: 24,
 *   updateInterval: 5,
 * }, {
 *   timeResolution: 60,
 *   windowsCount: 60,
 *   updateInterval: 10,
 * }]
 * ```
 *
 * ## View parameters
 *
 * There are three possible view parameters to setup:
 * - live - boolean flag, that tells whether the chart should be reloaded periodically
 *   and the newest points are from the "now" timestamp,
 * - lastWindowTimestamp - timestamp (in seconds) that describes which point
 *   should be rendered on the right edge of the chart (newer points edge).
 *   If null is provided, it is interpreted as "the newest possible timestamp".
 * - timeResolution - time resolution used to fetch and render chart points.
 *   It should correspond to timeResolution value of one of time resolutions specs.
 * All of these parameters are optional so it is allowed to provide a subset of
 * the above options.
 *
 * Example of view parameters change:
 * ```
 * configuration.setViewParameters({
 *   live: true,
 *   lastWindowTimestamp: null,
 *   timeResolution: 60,
 * });
 * ```
 *
 * # Configuration example
 *
 * Example of full configuration object initialization and setting view parameters:
 *
 * ```
 * const configuration = new Configuration({
 *   rawConfiguration: {
 *     title: 'Upload chart',
 *     yAxes: [{
 *       id: 'bytesAxis',
 *       name: 'Bytes',
 *       valueFormatter: {
 *         functionName: 'asBytes',
 *         functionArguments: {
 *           data: {
 *             functionName: 'abs',
 *             functionArguments: {
 *               data: {
 *                 functionName: 'supplyValue',
 *               },
 *             },
 *           },
 *         },
 *       },
 *     }],
 *     series: [{
 *       factoryName: 'static',
 *       factoryArguments: {
 *         seriesTemplate: {
 *           id: 'bytesSent',
 *           name: 'Sent',
 *           type: 'line',
 *           yAxisId: 'bytesAxis',
 *           color: '#ff0000',
 *           data: {
 *             functionName: 'abs',
 *             functionArguments: {
 *               data: {
 *                 functionName: 'loadSeries',
 *                 functionArguments: {
 *                   sourceType: 'external',
 *                   sourceParameters: {
 *                     externalSourceName: 'throughputSource',
 *                     externalSourceParameters: {
 *                       seriesNameId: 'upload',
 *                     },
 *                   },
 *                 },
 *               },
 *             },
 *           },
 *         },
 *       },
 *     }],
 *   },
 *   timeResolutionSpecs: [{
 *     timeResolution: 5,
 *     windowsCount: 24,
 *     updateInterval: 5,
 *   }, {
 *     timeResolution: 60,
 *     windowsCount: 60,
 *     updateInterval: 10,
 *   }],
 *   externalDataSources: {
 *     throughputSource: {
 *       fetchSeries: async (context, externalSourceParams) => { ... },
 *     },
 *   },
 * });
 * configuration.setViewParameters({
 *   live: true,
 *   lastWindowTimestamp: null,
 *   timeResolution: 60,
 * });
 * ```
 *
 * # Function types
 *
 * There are two function types, which can be used in raw configuration:
 * - transform functions - functions which are evaluated immediately (without promises).
 *   These functions don't accept points arrays as an input data,
 * - series functions - functions which are evaluated asynchronously (with promises).
 *   These functions can accept points arrays.
 *
 * That distinction is introduced to handle two types of calculations:
 * - transform-like calculations, which must be executed immediately and are not
 *   supposed to do any additional backend-related requests (transform functions).
 *   Example of such calculation is transforming value in Y axis to human-readable form.
 * - async calculations, which depends of some external, async process like
 *   fetching data from backend. Example of such calculation is preparing
 *   points array for series (hence the name "series functions").
 *
 * None of series function can be used in place of transform function due to its
 * async nature. Transform function, on the other hand, can be used by series function
 * (e.g to reuse its algorithm) and it is a common pattern. For example `multiply`
 * series function calls `multiply` transform function under the hood.
 * NOTE: series function arguments can only reference to other series functions.
 * Transform functions are not available at the series function definition level.
 *
 * @module utils/one-time-series-chart/configuration
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import State from './state';
import transformFunctionsIndex from './transform-functions';
import seriesFunctionsIndex from './series-functions';
import seriesFactoriesIndex from './series-factories';
import _ from 'lodash';
import { all as allFulfilled } from 'rsvp';
import moment from 'moment';
import Looper from 'onedata-gui-common/utils/looper';
import { set } from '@ember/object';
import reconcilePointsTiming from './series-functions/utils/reconcile-points-timing';

/**
 * @typedef {Object} OTSCConfigurationInitOptions
 * @property {OTSCRawConfiguration} rawConfiguration
 * @property {OTSCTimeResolutionSpec[]} timeResolutionSpecs
 * @property {OTSCExternalDataSources} externalDataSources
 * @property {number} [nowTimestampOffset]
 */

/**
 * @typedef {Object} OTSCRawConfiguration
 * @property {string} title
 * @property {OTSCRawYAxis[]} yAxes
 * @property {OTSCRawSeriesFactory[]} series
 */

/**
 * @typedef {Object} OTSCRawYAxis
 * @property {string} id
 * @property {string} name
 * @property {OTSCRawFunction} valueFormatter
 */

/**
 * @typedef {Object} OTSCRawSeriesFactory
 * @property {string} factoryName
 * @property {Object} factoryArguments
 */

/**
 * @typedef {Object} OTSCRawSeries
 * @property {string} id
 * @property {string} name
 * @property {OTSCChartType} type
 * @property {string} yAxisId
 * @property {string} [color]
 * @property {string} [stackId]
 * @property {OTSCRawFunction} data
 */

/**
 * @typedef {Object} OTSCRawFunction
 * @property {string} functionName
 * @property {Object} functionArguments
 */

/**
 * @typedef {OTSCSeriesFunctionPointsResult|OTSCSeriesFunctionBasicResult<T>} OTSCSeriesFunctionGenericResult<T>
 */

/**
 * @typedef {Object} OTSCSeriesFunctionPointsResult
 * @property {'points'} type
 * @property {Array<OTSCSeriesPoint>} data
 */

/**
 * @typedef {Object} OTSCSeriesFunctionBasicResult<T>
 * @property {'basic'} type
 * @property {T} data
 */

/**
 * @typedef {'bar'|'line'} OTSCChartType
 */

/**
 * @typedef {Object} OTSCExternalDataSourceRef
 * @property {'external'} sourceType
 * @property {OTSCExternalDataSourceRefParameters} sourceParameters
 */

/**
 * @typedef {Object} OTSCExternalDataSourceRefParameters
 * @property {string} externalSourceName
 * @property {Object} [externalSourceParameters]
 */

/**
 * @typedef {Object} OTSCTimeResolutionSpec
 * @property {number} timeResolution
 * @property {number} windowsCount
 * @property {number} updateInterval
 */

/**
 * @typedef {Object<string,OTSCExternalDataSource>} OTSCExternalDataSources
 */

/**
 * @typedef {Object} OTSCExternalDataSource
 * @property {(seriesParameters: OTSCDataSourceFetchParams, sourceParameters: Object) => Promise<unknown>} [fetchSeries]
 * @property {(sourceParameters: Object) => Promise<unknown[]>} [fetchDynamicSeriesConfigs]
 */

/**
 * @typedef {Object} OTSCDataSourceFetchParams
 * @property {number} lastWindowTimestamp
 * @property {number} timeResolution
 * @property {number} windowsCount
 */

/**
 * @typedef {Object} OTSCSeriesContext
 * @property {OTSCExternalDataSources} externalDataSources
 * @property {number} nowTimestamp
 * @property {number} lastWindowTimestamp
 * @property {number} timeResolution
 * @property {number} windowsCount
 */

/**
 * @typedef {OTSCSeriesContext} OTSCSeriesFactoryContext
 * @property {(context: Partial<OTSCSeriesFunctionContext>, seriesTemplate: OTSCRawSeries) => Promise<OTSCSeries>} evaluateSeries
 */

/**
 * @typedef {OTSCSeriesContext} OTSCSeriesFunctionContext
 * @property {(context: Partial<OTSCSeriesFunctionContext>, seriesFunction: OTSCRawFunction) => Promise<OTSCSeriesPoint[]>} evaluateSeriesFunction
 * @property {(context: Partial<OTSCTransformFunctionContext>, transformFunction: OTSCRawFunction) => unknown} evaluateTransformFunction
 */

/**
 * @typedef {Object} OTSCTransformFunctionContext
 * @property {(context: Partial<OTSCTransformFunctionContext>, transformFunction: OTSCRawFunction) => unknown} evaluateTransformFunction
 */

/**
 * @typedef {(configuration: OTSCConfiguration) => void} OTSCStateChangeHandler
 */

/**
 * @typedef {Object} OTSCViewParameters
 * @property {boolean} live
 * @property {number} lastWindowTimestamp
 * @property {number} timeResolution
 */

// 3, 4, 6 or 8 hex characters prefixed by `#`
const colorRegexp = /^#[0-9a-f]{3}([0-9a-f]([0-9a-f]{2}([0-9a-f]{2})?)?)?$/i;

export default class Configuration {
  /**
   * @public
   * @param {OTSCConfigurationInitOptions} options
   */
  constructor(options) {
    /**
     * @public
     * @readonly
     * @type {OTSCTimeResolutionSpec[]}
     */
    this.timeResolutionSpecs = options.timeResolutionSpecs ?
      options.timeResolutionSpecs.sortBy('timeResolution') : [];

    /**
     * @private
     * @type {OTSCRawConfiguration}
     */
    this.rawConfiguration = options.rawConfiguration;

    /**
     * @private
     * @type {OTSCExternalDataSources}
     */
    this.externalDataSources = options.externalDataSources;

    /**
     * @private
     * @type {number}
     */
    this.nowTimestampOffset = options.nowTimestampOffset || 0;

    /**
     * @private
     * @type {Set<OTSCStateChangeHandler>}
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
   * @param {OTSCStateChangeHandler} handler
   * @returns {void}
   */
  registerStateChangeHandler(handler) {
    this.stateChangeHandlers.add(handler);
  }

  /**
   * @public
   * @param {OTSCStateChangeHandler} handler
   * @returns {void}
   */
  deregisterStateChangeHandler(handler) {
    this.stateChangeHandlers.delete(handler);
  }

  /**
   * @public
   * @param {Partial<OTSCViewParameters>} parameters
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
   * @returns {OTSCViewParameters}
   */
  getViewParameters() {
    return {
      live: this.live,
      lastWindowTimestamp: this.lastWindowTimestamp,
      timeResolution: this.timeResolution,
    };
  }

  /**
   * @public
   * @returns {Promise<OTSCState>}
   */
  async getState() {
    const nowTimestamp = this.getNowTimestamp();
    const series = await this.getAllSeriesState({ nowTimestamp });
    if (!this.live && !this.newestWindowTimestamp && this.timeResolutionSpecs.length) {
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
          nowTimestamp,
        });
      }
      this.acquireNewestWindowTimestamp(seriesWithNewestTimestamp);
    }

    if (this.newestWindowTimestamp && series.length && series[0].data.length) {
      for (const singleSeries of series) {
        for (let i = singleSeries.data.length - 1; i >= 0; i--) {
          if (singleSeries.data[i].timestamp < this.newestWindowTimestamp) {
            break;
          }
          singleSeries.data[i].newest = true;
        }
      }
    }

    return new State({
      title: this.rawConfiguration && this.rawConfiguration.title,
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

  /**
   * @param {OTSCSeries} series
   * @returns {void}
   */
  async acquireNewestWindowTimestamp(series) {
    this.newestWindowTimestamp = series.length && series[0].data.length ?
      series[0].data[series[0].data.length - 1].timestamp : this.getNowTimestamp();
  }

  /**
   * @private
   * @returns {OTSCYAxisConfiguration[]}
   */
  getYAxesState() {
    const rawYAxes = this.rawConfiguration && this.rawConfiguration.yAxes || [];
    return rawYAxes.map((rawYAxis) => {
      const rawValueFormatter = this.isRawFunction(rawYAxis.valueFormatter) ?
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
   * @param {OTSCSeries[]} seriesState
   * @returns {OTSCXAxisConfiguration}
   */
  getXAxisState(seriesState) {
    const timestamps = seriesState.length ? seriesState[0].data.mapBy('timestamp') : [];
    return {
      timestamps,
      timestampFormatter: (timestamp) => this.formatTimestamp(timestamp),
    };
  }

  /**
   * @private
   * @param {Partial<OTSCSeriesContext>} [context]
   * @returns {Promise<OTSCSeries[]>}
   */
  async getAllSeriesState(context) {
    const normalizedContext = this.normalizeSeriesContext(context);
    if (!normalizedContext.evaluateSeries) {
      normalizedContext.evaluateSeries = (...args) => this.getSeriesState(...args);
    }
    const rawSeries = this.rawConfiguration && this.rawConfiguration.series || [];
    const seriesPerFactory = await allFulfilled(
      rawSeries.map((seriesFactory) => {
        const factoryFunction = seriesFactoriesIndex[seriesFactory.factoryName];
        if (!factoryFunction) {
          throw {
            id: 'unknownOTSCFactory',
            details: {
              factoryName: seriesFactory.factoryName,
            },
          };
        }
        return factoryFunction(normalizedContext, seriesFactory.factoryArguments);
      })
    );
    const allSeries = _.flatten(seriesPerFactory);
    reconcilePointsTiming(allSeries.mapBy('data'));
    return allSeries;
  }

  /**
   * @private
   * @param {Partial<OTSCSeriesContext>|null} context
   * @param {OTSCRawSeries} series
   * @returns {Promise<OTSCSeries>}
   */
  async getSeriesState(context, series) {
    const [
      { data: id },
      { data: name },
      { data: type },
      { data: yAxisId },
      { data: color },
      { data: stackId },
      data,
    ] = await allFulfilled([
      'id',
      'name',
      'type',
      'yAxisId',
      'color',
      'stackId',
      'data',
    ].map(propName =>
      this.evaluateSeriesFunction(context, series[propName])
    ));
    const normalizedData = data.type === 'points' ? data.data : [];
    return {
      id,
      name,
      type,
      yAxisId,
      color: this.normalizeColor(color),
      stackId: stackId || null,
      data: normalizedData,
    };
  }

  /**
   * @private
   * @param {Partial<OTSCTransformFunctionContext>|null} context
   * @param {OTSCRawFunction} transformFunction
   * @returns {unknown}
   */
  evaluateTransformFunction(context, transformFunction) {
    if (!this.isRawFunction(transformFunction)) {
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
        id: 'unknownOTSCFactory',
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
   * @private
   * @param {Partial<OTSCSeriesFunctionContext>|null} context
   * @param {OTSCRawFunction} seriesFunction
   * @returns {Promise<OTSCSeriesPoint[]>}
   */
  async evaluateSeriesFunction(context, seriesFunction) {
    if (!this.isRawFunction(seriesFunction)) {
      // When `seriesFunction` isn't a function definition, then it is
      // probably a constant value
      return {
        type: 'basic',
        data: seriesFunction,
      };
    }

    const normalizedContext = this.normalizeSeriesContext(context);
    if (!normalizedContext.evaluateSeriesFunction) {
      normalizedContext.evaluateSeriesFunction =
        (...args) => this.evaluateSeriesFunction(...args);
    }
    if (!normalizedContext.evaluateTransformFunction) {
      normalizedContext.evaluateTransformFunction =
        (...args) => this.evaluateTransformFunction(...args);
    }

    const seriesFunctionCallback =
      seriesFunctionsIndex[seriesFunction.functionName];
    if (!seriesFunctionCallback) {
      throw {
        id: 'unknownOTSCFactory',
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
    } else if (this.timeResolution % (24 * 60 * 60) !== 0) {
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
   * @returns {OTSCSeriesContext}
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

  /**
   * @private
   * @param {unknown} rawFunction
   * @returns {void}
   */
  isRawFunction(rawFunction) {
    return rawFunction && typeof rawFunction.functionName === 'string';
  }
}
