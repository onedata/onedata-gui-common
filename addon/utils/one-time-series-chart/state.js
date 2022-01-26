/**
 * A class, that represents a state (snapshot) of time series chart configuration
 * with series evaluated according to the view parameters. It contains data
 * ready to use by chart visualisation library.
 *
 * @module utils/one-time-series-chart/state
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import _ from 'lodash';

/**
 * @typedef {Object} OTSCStateInitOptions
 * @property {string} title
 * @property {OTSCYAxis[]} yAxes
 * @property {OTSCXAxis} xAxis
 * @property {OTSCSeries[]} series
 * @property {number} timeResolution
 * @property {number} windowsCount
 * @property {number} newestWindowTimestamp
 */

/**
 * @typedef {Object} OTSCYAxis
 * @property {string} id
 * @property {string} name
 * @property {(value: unknown) => string} valueFormatter
 */

/**
 * @typedef {Object} OTSCXAxis
 * @property {number[]} timestamps
 * @property {(timestamp: number) => string} timestampFormatter
 */

/**
 * @typedef {Object} OTSCSeries
 * @property {string} id
 * @property {string} name
 * @property {OTSCChartType} type
 * @property {string} yAxisId
 * @property {string|null} color
 * @property {string|undefined} stackId
 * @property {OTSCSeriesPoint[]} data
 */

/**
 * @typedef {Object} OTSCSeriesPoint
 * @property {number} timestamp
 * @property {number} value
 * @property {boolean} oldest
 * @property {boolean} newest
 * @property {boolean} fake
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
    this.windowsCount = options.windowsCount;

    /**
     * @public
     * @readonly
     * @type {number|null}
     */
    this.newestWindowTimestamp = options.newestWindowTimestamp;

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
    this.firstWindowTimestamp = null;

    /**
     * @public
     * @readonly
     * @type {number}
     */
    this.lastWindowTimestamp = null;

    const firstSeriesData = this.series[0] && this.series[0].data;
    if (firstSeriesData && firstSeriesData.length) {
      this.firstWindowTimestamp = firstSeriesData[0].timestamp;
      this.lastWindowTimestamp = firstSeriesData[firstSeriesData.length - 1].timestamp;
    }
  }

  /**
   * @public
   * @returns {ECOption}
   */
  asEchartState() {
    const yAxisIdToIdxMap = this.yAxes.reduce((acc, yAxis, idx) => {
      acc[yAxis.id] = idx;
      return acc;
    }, {});

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            show: false,
          },
        },
        formatter: (paramsArray) => {
          if (!Array.isArray(paramsArray) || paramsArray.length === 0) {
            return null;
          }
          const timestamp = Number.parseInt(paramsArray[0].value[0]);
          const formattedTimestamp = this.xAxis.timestampFormatter(timestamp);
          const headerHtml =
            `<div class="tooltip-header">${_.escape(formattedTimestamp)}</div>`;
          const seriesHtml = paramsArray.map(({
            seriesId,
            seriesName,
            value: [, yValue],
            marker,
          }) => {
            const series = this.series.findBy('id', seriesId);
            const yAxis = series && this.yAxes.findBy('id', series.yAxisId);
            const valueFormatter = yAxis ? yAxis.valueFormatter : (val) => val;
            return `<div class="tooltip-series"><span class="tooltip-series-label">${marker} ${_.escape(seriesName)}</span> <span class="tooltip-series-value">${_.escape(valueFormatter(yValue))}</span></div>`;
          }).join('');

          return `${headerHtml}${seriesHtml}`;
        },
      },
      yAxis: this.yAxes.map((yAxis) => ({
        type: 'value',
        name: yAxis.name,
        axisLine: {
          show: true,
        },
        axisLabel: {
          formatter: (value) => yAxis.valueFormatter(value),
        },
      })),
      xAxis: {
        type: 'category',
        data: this.xAxis.timestamps.map(timestamp => String(timestamp)),
        axisLabel: {
          showMaxLabel: true,
          formatter: (value) => this.xAxis.timestampFormatter(value),
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      series: this.series.map((series) => ({
        id: series.id,
        name: series.name,
        type: series.type,
        yAxisIndex: yAxisIdToIdxMap[series.yAxisId],
        color: series.color,
        stack: series.stackId,
        data: series.data.map(({ timestamp, value }) => [String(timestamp), value]),
      })),
    };
  }
}
