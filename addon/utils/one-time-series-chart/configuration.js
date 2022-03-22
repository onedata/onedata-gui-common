/**
 * A class, that contains configuration of time series chart - axes look,
 * time resolutions, actual axes position, visible points - basically everything,
 * that is visible on the screen. Configuration is not constant - it changes
 * over time as it contains chart points representing some variable process
 * which happens remotely. Hence to access current chart configuration,
 * you have to get its "state" via `getState()` method. After that
 * the latest snapshot of configuration is prepared and returned. It is possible
 * to listen to configuration changes (to know when to call `getState()` again and
 * update the view) - see methods `registerStateChangeHandler`
 * and `deregisterStateChangeHandler`.
 *
 * # Main configuration elements
 *
 * Configuration consists of 4 main configuration parts:
 * - chart definition (`chartDefinition`) - contains definitions of axes, series,
 *   series groups and all settings, which don't depend on data itself.
 *   Is provided during configuration object creation and cannot be modified.
 * - data sources configuration (`externalDataSources`) - contains data sources
 *   definitions, which are mentioned by various elements from chart definition.
 *   Each data source definition includes callbacks, which provide data like
 *   points arrays, dynamic series configs etc. Is provided during configuration
 *   object creation and cannot be modified.
 * - time resolutions (`timeResolutionSpecs`) - possible time resolutions which can
 *   be rendered by the chart. These strongly depend on characteristics of data
 *   sources (as each data source can have different set of time resolutions).
 *   Are provided during configuration object creation and cannot be modified.
 * - view parameters (via `setViewParameters()`) - navigation-like properties,
 *   that define which part of the chart is visible. Are provided after
 *   configuration object creation and can be modified during the whole chart life.
 *
 * ## Chart definition
 *
 * The chart definition is that part of the configuration, which is constant regardless
 * backend data. It is a pure definition of series and axes - basically all visual
 * settings - and is completely detached from concrete data. It consists of:
 * - title - an object describing the chart title. Contains two fields - `content` and `tip`,
 * - yAxes - an array of Y axes definitions. Usually only one Y axis will be necessary,
 *   but for more complicated usecases it is possible to render more of them and visualise
 *   data from different domains.
 * - series - an array of series definitions which describe from which data and how
 *   points should be rendered.
 * - seriesGroups - an array of series group definitions which describe how series
 *   in a specific group should behave.
 *
 * As you can see there is no X axis configuration. Time series charts are always
 * based on time X axis, so there is nothing to configure.
 *
 * ### Y axis definition
 *
 * Each Y axis definition consists of:
 * - id - string id which allows to reference to it later,
 * - name - short human-readable name, that will be rendered as an axis label
 * - minInterval - optional number value, which determines minimum values gap between
 *   Y axis split lines. For example setting it to `1` will force only integer Y axis
 *   split lines.
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
 *   minInterval: 1,
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
 * - groupId - (optional) string id, which allows to include series into
 *   a specific series group,
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
 * ### Series group definitions
 *
 * Series groups is an optional feature which allows to aggregate series into groups
 * which provides possibility to:
 * - introduce stacking,
 * - group series in tooltip with optional group name and values sum.
 *
 * Like series, series groups are also created using factories - static and dynamic -
 * inside array `chartConfiguration.seriesGroups`. Series group template consists of:
 * - id - string id of a group,
 * - name - (optional) group name, that will be visible in tooltip,
 * - stack - (optional) boolean flag which turns on series stacking,
 * - showSeriesSum - (optional) boolean flag which enabled showing total value of
 *   all series related to a group. It will be visible next to the group name in tooltip
 *
 * Examples:
 * ```
 * // Static series group factory
 * {
 *   factoryName: 'static',
 *   factoryArguments: {
 *     seriesGroupTemplate: {
 *       id: 'g1,
 *       name: 'group1',
 *       stack: true,
 *       showSeriesSum: true,
 *     },
 *   },
 * }
 *
 * // Dynamic series group factory
 * {
 *   factoryName: 'dynamic',
 *   factoryArguments: {
 *     dynamicSeriesGroupConfigs: {
 *       sourceType: 'external',
 *       sourceParameters: {
 *         externalSourceName: 'mySource',
 *         externalSourceParameters: { ... },
 *       },
 *     },
 *     seriesGroupTemplate: {
 *       id: {
 *         functionName: 'getDynamicSeriesGroupConfigData',
 *         functionArguments: {
 *           propertyName: 'id',
 *         },
 *       },
 *       name: 'group2',
 *       stack: true,
 *       showSeriesSum: false,
 *     },
 *   },
 * }
 * ```
 *
 * To connect series to series group you need to assign group id to `groupId` field of
 * specific series definition.
 *
 * Using groups changes order of series inside tooltip. At the beginning ungrouped series
 * are shown, then groups ordered as were defined in chart definition.
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
 *     fetchSeries: async (context, externalSourceParameters) => { ... },
 *     fetchDynamicSeriesConfigs: async (externalSourceParameters) => { ... },
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
 * - pointsCount - number of points which should be rendered in that
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
 *   pointsCount: 24,
 *   updateInterval: 5,
 * }, {
 *   timeResolution: 60,
 *   pointsCount: 60,
 *   updateInterval: 10,
 * }]
 * ```
 *
 * ## View parameters
 *
 * There are three possible view parameters to setup:
 * - live - boolean flag, that tells whether the chart should be reloaded periodically
 *   and the newest points are from the "now" timestamp,
 * - lastPointTimestamp - timestamp (in seconds) that describes which point
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
 *   lastPointTimestamp: null,
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
 *   chartDefinition: {
 *     title: { content: 'Upload chart' },
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
 *   externalDataSources: {
 *     throughputSource: {
 *       fetchSeries: async (context, externalSourceParameters) => { ... },
 *     },
 *   },
 *   timeResolutionSpecs: [{
 *     timeResolution: 5,
 *     pointsCount: 24,
 *     updateInterval: 5,
 *   }, {
 *     timeResolution: 60,
 *     pointsCount: 60,
 *     updateInterval: 10,
 *   }],
 * });
 * configuration.setViewParameters({
 *   live: true,
 *   lastPointTimestamp: null,
 *   timeResolution: 60,
 * });
 * ```
 *
 * # Function types
 *
 * There are two function types, which can be used in chart definition:
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
import seriesGroupFactoriesIndex from './series-group-factories';
import _ from 'lodash';
import { all as allFulfilled } from 'rsvp';
import moment from 'moment';
import Looper from 'onedata-gui-common/utils/looper';
import { set } from '@ember/object';
import reconcilePointsTiming from './series-functions/utils/reconcile-points-timing';

/**
 * @typedef {Object} OTSCConfigurationInitOptions
 * @property {OTSCChartDefinition} chartDefinition
 * @property {OTSCTimeResolutionSpec[]} timeResolutionSpecs
 * @property {OTSCExternalDataSources} externalDataSources
 * @property {number} [nowTimestampOffset]
 */

/**
 * @typedef {Object} OTSCChartDefinition
 * @property {OTSCRawTitle} [title]
 * @property {OTSCRawYAxis[]} yAxes
 * @property {OTSCRawSeriesFactory[]} series
 */

/**
 * @typedef {Object} OTSCRawTitle
 * @property {string} content
 * @property {string} [tip]
 */

/**
 * @typedef {Object} OTSCRawYAxis Y axis definition
 * @property {string} id
 * @property {string} name will be visible as an axis label
 * @property {number} [minInterval] minimum gap between axis split lines.
 * @property {OTSCRawFunction} [valueFormatter] definition of a chart values
 * converter, that makes them more human-readable
 */

/**
 * @typedef {Object} OTSCRawSeriesGroupFactory
 * @property {string} factoryName
 * @property {Object} factoryArguments
 */

/**
 * @typedef {Object} OTSCRawSeriesGroup
 * @property {string} id
 * @property {string} [name]
 * @property {boolean} [stack]
 * @property {boolean} [showSeriesSum]
 */

/**
 * @typedef {Object} OTSCRawSeriesFactory
 * @property {string} factoryName
 * @property {Object} factoryArguments
 */

/**
 * @typedef {Object} OTSCRawSeries
 * @property {string} id
 * @property {string} name will be visible as a series label
 * @property {OTSCChartType} type
 * @property {string} yAxisId id of Y axis, which should be used to draw points
 * @property {string} [color] color in hex format, e.g. `'#ff0000'`
 * @property {string} [groupId] adds series to a specific series group
 * @property {OTSCRawFunction} data definition of function responsible for
 *   generating series points
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
 * @typedef {Object} OTSCSeriesFunctionPointsResult Represents data possible to
 *   render as points.
 * @property {'points'} type
 * @property {Array<OTSCSeriesPoint>} data
 */

/**
 * @typedef {Object} OTSCSeriesFunctionBasicResult<T> Represents all types of data,
 *   that cannot be rendered directly as points (like objects, numbers, etc.).
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
 * @property {number} timeResolution how many seconds are aggregated into a
 *   single point. E.g. `60` means that each point represents data from one minute
 * @property {number} pointsCount how many consecutive points should be rendered.
 *   `pointsCount * timeResolution` is equal to total time span visible on chart.
 *   This value describes only the points number visible to user. During the chart state
 *   calculation some functions can try to fetch less/more points than specified here.
 * @property {number} updateInterval interval (in seconds) describing how often
 *   should live charts be updated
 */

/**
 * @typedef {Object<string,OTSCExternalDataSource>} OTSCExternalDataSources
 */

/**
 * @typedef {Object} OTSCExternalDataSource
 * @property {(seriesParameters: OTSCDataSourceFetchParams, sourceParameters: Object) => Promise<unknown>} [fetchSeries]
 * @property {(sourceParameters: Object) => Promise<unknown[]>} [fetchDynamicSeriesConfigs]
 * @property {(sourceParameters: Object) => Promise<unknown[]>} [fetchDynamicSeriesGroupConfigs]
 */

/**
 * @typedef {Object} OTSCDataSourceFetchParams
 * @property {number} lastPointTimestamp timestamp of point, which should be at
 *   the right edge of the chart (edge of "newer" points)
 * @property {number} timeResolution see `OTSCTimeResolutionSpec` documentation
 * @property {number} pointsCount see `OTSCTimeResolutionSpec` documentation
 */

/**
 * @typedef {Object} OTSCSeriesContext Contains data required during chart state
 *   calculation. It's a way to avoid passing some global structure between
 *   all calculation stages (as each can have its own context). It also allows
 *   to modify context data on-the-fly regarding specific needs (like fetching
 *   additional points).
 * @property {OTSCExternalDataSources} externalDataSources reference to data sources
 *   so all chart functions have an access to external data
 * @property {number} nowTimestamp timestamp (in seconds) considered to be a "now"
 *   time. Passed to synchronize all chart element and to not depend on own
 *   "now" timestamps calculations
 * @property {number} lastPointTimestamp timestamp of a point, that should be the
 *   newest point in the current view. It usually is at the right edge of the
 *   chart (edge of "newer" points) and corresponds to `lastPointTimestamp` in
 *   `OTSCViewParameters`
 * @property {number} timeResolution see `OTSCTimeResolutionSpec` documentation
 * @property {number} pointsCount see `OTSCTimeResolutionSpec` documentation
 */

/**
 * @typedef {OTSCSeriesContext} OTSCSeriesFactoryContext
 * @property {(context: Partial<OTSCSeriesFunctionContext>, seriesTemplate: OTSCRawSeries) => Promise<OTSCSeries>} evaluateSeries
 */

/**
 * @typedef {OTSCSeriesContext} OTSCSeriesFunctionContext
 * @property {(context: Partial<OTSCSeriesFunctionContext>, seriesFunction: OTSCRawFunction) => Promise<OTSCSeriesFunctionGenericResult<unknown>>} evaluateSeriesFunction
 * @property {(context: Partial<OTSCTransformFunctionContext>, transformFunction: OTSCRawFunction) => unknown} evaluateTransformFunction
 */

/**
 * @typedef {Object} OTSCTransformFunctionContext
 * @property {(context: Partial<OTSCTransformFunctionContext>, transformFunction: OTSCRawFunction) => unknown} evaluateTransformFunction
 */

/**
 * @typedef {Object} OTSCSeriesGroupFactoryContext
 * @property {OTSCExternalDataSources} externalDataSources
 * @property {(context: Partial<OTSCTransformFunctionContext>, seriesGroupTemplate: OTSCRawSeriesGroup) => OTSCSeriesGroup} evaluateSeriesGroup
 */

/**
 * @typedef {(configuration: OTSCConfiguration) => void} OTSCStateChangeHandler
 */

/**
 * @typedef {Object} OTSCViewParameters
 * @property {boolean} live if true, then chart will reload its data continuously.
 *   It also means, that "now" timestamp will always be treated as a newest point
 *   - even if data sources does not provide points for that time.
 * @property {number} lastPointTimestamp timestamp of point, which should be at
 *   the right edge of the chart (edge of "newer" points). If is null, it represents
 *   the newest possible point.
 * @property {number} timeResolution see `OTSCTimeResolutionSpec` documentation
 */

/**
 * @typedef {Object} RawOTSCSeriesPoint
 * @property {number} timestamp
 * @property {number} value
 */

/** 3, 4, 6 or 8 hex characters prefixed by `#` */
const colorRegexp = /^#[0-9a-f]{3}([0-9a-f]([0-9a-f]{2}([0-9a-f]{2})?)?)?$/i;

export default class Configuration {
  /**
   * @public
   * @param {OTSCConfigurationInitOptions} options
   */
  constructor(options) {
    /**
     * By default, time resolutions are sorted by resolution value ascending
     * - the smallest resolutions (like seconds, minutes) will be first.
     * @public
     * @readonly
     * @type {OTSCTimeResolutionSpec[]}
     */
    this.timeResolutionSpecs = options.timeResolutionSpecs ?
      options.timeResolutionSpecs.sortBy('timeResolution') : [];

    /**
     * @private
     * @type {OTSCChartDefinition}
     */
    this.chartDefinition = options.chartDefinition;

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
    this.lastPointTimestamp = null;

    /**
     * @private
     * @type {number}
     */
    this.timeResolution = null;

    /**
     * @private
     * @type {number}
     */
    this.pointsCount = null;

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
    this.newestPointTimestamp = null;

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
   * @returns {void}
   */
  destroy() {
    this.stateChangeHandlers.clear();
    this.updater.destroy();
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
    if (parameters.timeResolution !== undefined) {
      this.changeTimeResolution(parameters.timeResolution);
    }
    if (parameters.lastPointTimestamp !== undefined) {
      if (this.live) {
        const nowTimestamp = this.getNowTimestamp();
        const givenTimestampIsNow = typeof parameters.lastPointTimestamp !== 'number' ||
          parameters.lastPointTimestamp >= nowTimestamp - (nowTimestamp % this.timeResolution);
        this.lastPointTimestamp = givenTimestampIsNow ?
          null : parameters.lastPointTimestamp;
      } else {
        if (typeof this.newestPointTimestamp === 'number') {
          this.lastPointTimestamp = typeof parameters.lastPointTimestamp === 'number' ?
            Math.min(this.newestPointTimestamp, parameters.lastPointTimestamp) : this.newestPointTimestamp;
        } else {
          this.lastPointTimestamp = typeof parameters.lastPointTimestamp === 'number' ?
            parameters.lastPointTimestamp : null;
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
      lastPointTimestamp: this.lastPointTimestamp,
      timeResolution: this.timeResolution,
    };
  }

  /**
   * @public
   * @returns {Promise<OTSCState>}
   */
  async getState() {
    const nowTimestamp = this.getNowTimestamp();
    const [series, seriesGroups] = await allFulfilled([
      this.getAllSeriesState({ nowTimestamp }),
      this.getSeriesGroupsState(),
    ]);
    if (!this.live && !this.newestPointTimestamp && this.timeResolutionSpecs.length) {
      let seriesWithNewestTimestamp = series;
      // Finding resolution with points aggregating the smallest portion of time.
      const smallestTimeResolution =
        this.timeResolutionSpecs.sortBy('timeResolution')[0].timeResolution;
      if (
        this.lastPointTimestamp ||
        this.timeResolution !== smallestTimeResolution ||
        !this.pointsCount
      ) {
        seriesWithNewestTimestamp = await this.getAllSeriesState({
          lastPointTimestamp: null,
          timeResolution: smallestTimeResolution,
          pointsCount: 1,
          nowTimestamp,
        });
      }
      this.acquireNewestPointTimestamp(seriesWithNewestTimestamp);
    }

    if (this.newestPointTimestamp && series.length && series[0].data.length) {
      for (const singleSeries of series) {
        for (let i = singleSeries.data.length - 1; i >= 0; i--) {
          if (singleSeries.data[i].timestamp < this.newestPointTimestamp) {
            break;
          }
          singleSeries.data[i].newest = true;
        }
      }
    }

    return new State({
      title: this.getTitleState(),
      yAxes: this.getYAxesState(),
      xAxis: this.getXAxisState(series),
      seriesGroups,
      series,
      timeResolution: this.timeResolution,
      pointsCount: this.pointsCount,
      newestPointTimestamp: this.newestPointTimestamp,
    });
  }

  /**
   * @param {OTSCSeries} series
   * @returns {void}
   */
  async acquireNewestPointTimestamp(series) {
    this.newestPointTimestamp = series.length && series[0].data.length ?
      series[0].data[series[0].data.length - 1].timestamp : this.getNowTimestamp();
  }

  /**
   * @returns {OTSCTitle}
   */
  getTitleState() {
    const titleState = {
      content: '',
      tip: '',
    };
    const title = this.chartDefinition && this.chartDefinition.title;
    if (title) {
      if (title.content) {
        titleState.content = title.content;
        if (title.tip) {
          titleState.tip = title.tip;
        }
      }
    }
    return titleState;
  }

  /**
   * @private
   * @returns {OTSCYAxisConfiguration[]}
   */
  getYAxesState() {
    const rawYAxes = this.chartDefinition && this.chartDefinition.yAxes || [];
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
        minInterval: rawYAxis.minInterval || null,
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
   * @returns {Promise<OTSCSeriesGroup[]>}
   */
  async getSeriesGroupsState() {
    const rawFactories = this.chartDefinition && this.chartDefinition.seriesGroups || [];
    const context = {
      externalDataSources: this.externalDataSources,
      evaluateSeriesGroup: (...args) => this.getSeriesGroupState(...args),
      evaluateTransformFunction: (...args) => this.evaluateTransformFunction(...args),
    };
    const groupsPerFactory = await allFulfilled(
      rawFactories.map((seriesGroupFactory) => {
        const factoryFunction = seriesGroupFactoriesIndex[seriesGroupFactory.factoryName];
        if (!factoryFunction) {
          throw {
            id: 'unknownOTSCFactory',
            details: {
              factoryName: seriesGroupFactory.factoryName,
            },
          };
        }
        return factoryFunction(context, seriesGroupFactory.factoryArguments);
      })
    );
    return _.flatten(groupsPerFactory);
  }

  /**
   * @private
   * @param {Partial<OTSCTransformFunctionContext|null>} context
   * @param {OTSCRawSeriesGroup} seriesGroup
   */
  getSeriesGroupState(context, seriesGroup) {
    const [
      id,
      name,
      stack,
      showSeriesSum,
    ] = [
      'id',
      'name',
      'stack',
      'showSeriesSum',
    ].map(propName =>
      this.evaluateTransformFunction(context, seriesGroup[propName])
    );
    return {
      id,
      name: name || '',
      stack: Boolean(stack),
      showSeriesSum: Boolean(showSeriesSum),
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
    const rawSeries = this.chartDefinition && this.chartDefinition.series || [];
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
      { data: groupId },
      data,
    ] = await allFulfilled([
      'id',
      'name',
      'type',
      'yAxisId',
      'color',
      'groupId',
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
      groupId: groupId || null,
      data: normalizedData,
    };
  }

  /**
   * @private
   * @param {Partial<OTSCTransformFunctionContext>|null} context context,
   *   which should be used during the evaluation of passed function. Context is
   *   a local setup (environment) of function execution - it may change between
   *   different function evaluations depending on needs.
   * @param {OTSCRawFunction|unknown} transformFunctionOrValue
   * @returns {unknown}
   */
  evaluateTransformFunction(context, transformFunctionOrValue) {
    if (!this.isRawFunction(transformFunctionOrValue)) {
      // When `transformFunction` isn't a function definition, then it is
      // probably a constant value
      return transformFunctionOrValue;
    }

    const normalizedContext = context || {};
    if (!normalizedContext.evaluateTransformFunction) {
      normalizedContext.evaluateTransformFunction =
        (...args) => this.evaluateTransformFunction(...args);
    }

    const transformFunctionCallback =
      transformFunctionsIndex[transformFunctionOrValue.functionName];
    if (!transformFunctionCallback) {
      throw {
        id: 'unknownOTSCFactory',
        details: {
          functionName: transformFunctionOrValue.functionName,
        },
      };
    }

    return transformFunctionCallback(
      normalizedContext,
      transformFunctionOrValue.functionArguments
    );
  }

  /**
   * @private
   * @param {Partial<OTSCSeriesFunctionContext>|null} context context,
   *   which should be used during the evaluation of passed function. Context is
   *   a local setup (environment) of function execution - it may change between
   *   different function evaluations depending on needs.
   * @param {OTSCRawFunction|unknown} seriesFunctionOrValue
   * @returns {Promise<OTSCSeriesPoint[]>}
   */
  async evaluateSeriesFunction(context, seriesFunctionOrValue) {
    if (!this.isRawFunction(seriesFunctionOrValue)) {
      // When `seriesFunction` isn't a function definition, then it is
      // probably a constant value
      return {
        type: 'basic',
        data: seriesFunctionOrValue,
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
      seriesFunctionsIndex[seriesFunctionOrValue.functionName];
    if (!seriesFunctionCallback) {
      throw {
        id: 'unknownOTSCFactory',
        details: {
          functionName: seriesFunctionOrValue.functionName,
        },
      };
    }

    return await seriesFunctionCallback(
      normalizedContext,
      seriesFunctionOrValue.functionArguments
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
    this.pointsCount = timeResolutionSpec.pointsCount;
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
    if (!('lastPointTimestamp' in normalizedContext)) {
      if (this.live && !this.lastPointTimestamp) {
        normalizedContext.lastPointTimestamp = normalizedContext.nowTimestamp;
      } else {
        normalizedContext.lastPointTimestamp = this.lastPointTimestamp;
      }
    }
    if (typeof normalizedContext.timeResolution !== 'number') {
      normalizedContext.timeResolution = this.timeResolution;
    }
    if (typeof normalizedContext.pointsCount !== 'number') {
      normalizedContext.pointsCount = this.pointsCount;
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
