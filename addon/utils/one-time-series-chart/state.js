/**
 * A class, that represents a state (snapshot) of time series chart configuration
 * with series evaluated according to the view parameters. It contains data
 * ready to use by chart visualisation library.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import stateToEchart from './state-converters/to-echart';

/**
 * @typedef {Object} OTSCStateInitOptions
 * @property {OTSCTitle} title
 * @property {OTSCYAxis[]} yAxes
 * @property {OTSCXAxis} xAxis
 * @property {OTSCSeriesGroup[]} seriesGroups
 * @property {OTSCSeries[]} series
 * @property {number} timeResolution
 * @property {number} pointsCount
 * @property {number|null} newestPointTimestamp globally newest point timestamp
 * of a chart. I is null in `live` mode.
 */

/**
 * @typedef {Object} OTSCTitle
 * @property {string} content
 * @property {string} tip
 */

/**
 * @typedef {Object} OTSCYAxis
 * @property {string} id
 * @property {string} name
 * @property {number|null} minInterval
 * @property {(value: unknown) => string} valueFormatter
 */

/**
 * @typedef {Object} OTSCXAxis
 * @property {number[]} timestamps
 * @property {(timestamp: number) => string} timestampFormatter
 */

/**
 * @typedef {Object} OTSCSeriesGroup Represents a group of series. Allows stacking
 * and special formatting of series entries in tooltip.
 * @property {string} id
 * @property {string} name series group name (visible in tooltip)
 * @property {boolean} stacked if true, all series in group will be stacked
 * @property {boolean} showSum if true, tooltip will show sum of all series in group
 * @property {Array<OTSCSeriesGroup>} subgroups
 */

/**
 * @typedef {Object} OTSCSeries
 * @property {string} id
 * @property {string} name
 * @property {OTSCChartType} type
 * @property {string} yAxisId
 * @property {string|null} color
 * @property {string|null} groupId
 * @property {Utils.OneTimeSeriesChart.Point[]} data
 */

export default class State {
  /**
   * @public
   * @param {OTSCStateInitOptions} options
   */
  constructor(options) {
    /**
     * @public
     * @readonly
     * @type {string}
     */
    this.title = options.title;

    /**
     * @public
     * @readonly
     * @type {OTSCYAxis[]}
     */
    this.yAxes = options.yAxes || [];

    /**
     * @public
     * @readonly
     * @type {OTSCXAxis}
     */
    this.xAxis = options.xAxis || {
      timestamps: [],
      timestampFormatter: (value) => value,
    };

    /**
     * @public
     * @readonly
     * @type {OTSCSeriesGroup[]}
     */
    this.seriesGroups = options.seriesGroups || [];

    /**
     * @public
     * @readonly
     * @type {OTSCSeries[]}
     */
    this.series = options.series || [];

    /**
     * @public
     * @readonly
     * @type {number}
     */
    this.timeResolution = options.timeResolution;

    /**
     * @public
     * @readonly
     * @type {number}
     */
    this.pointsCount = options.pointsCount;

    /**
     * @public
     * @readonly
     * @type {number|null}
     */
    this.newestPointTimestamp = options.newestPointTimestamp;

    /**
     * @public
     * @readonly
     * @type {boolean}
     */
    this.hasReachedOldest = this.series.every((series) =>
      !series.data.length || series.data[0].oldest
    );

    /**
     * @public
     * @readonly
     * @type {boolean}
     */
    this.hasReachedNewest = this.series.every((series) =>
      !series.data.length || series.data[series.data.length - 1].newest
    );

    /**
     * @public
     * @readonly
     * @type {number}
     */
    this.firstPointTimestamp = null;

    /**
     * @public
     * @readonly
     * @type {number}
     */
    this.lastPointTimestamp = null;

    const firstSeriesData = this.series[0] && this.series[0].data;
    if (firstSeriesData && firstSeriesData.length) {
      this.firstPointTimestamp = firstSeriesData[0].timestamp;
      this.lastPointTimestamp = firstSeriesData[firstSeriesData.length - 1].timestamp;
    }
  }

  /**
   * @public
   * @returns {ECOption}
   */
  asEchartState() {
    return stateToEchart(this);
  }
}
