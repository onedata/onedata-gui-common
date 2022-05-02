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
 * @property {OTSCTitle} title
 * @property {OTSCYAxis[]} yAxes
 * @property {OTSCXAxis} xAxis
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
 * @property {boolean} stack if true, all series in group will be stacked
 * @property {boolean} showSeriesSum if true, tooltip will show sum of all series in group
 */

/**
 * @typedef {Object} OTSCSeries
 * @property {string} id
 * @property {string} name
 * @property {OTSCChartType} type
 * @property {string} yAxisId
 * @property {string|null} color
 * @property {string|null} groupId
 * @property {OTSCSeriesPoint[]} data
 */

/**
 * @typedef {OTSCRawSeriesPoint} OTSCSeriesPoint
 * @property {number|null} value null means, that value in this point is unknown
 * @property {boolean} fake when set to true, it means that this point has been
 *   generated on-the-fly because data source did not mention it. It may happen
 *   when there are time gaps in incoming data or there is a need to provide
 *   extra points to fill the whole chart near the data oldest/newest sides.
 * @property {boolean} oldest when set to true, it means that before this point
 *   there are no other (meaningful) points available. There can exist some e.g.
 *   for chart points alignment purposes, but all of them will be fake.
 * @property {boolean} newest when set to true, it means that after this point
 *   there are no other (meaningful) points available. There can exist some e.g.
 *   for chart points alignment purposes, but all of them will be fake.
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
    const yAxisIdToIdxMap = this.yAxes.reduce((acc, yAxis, idx) => {
      acc[yAxis.id] = idx;
      return acc;
    }, {});
    const yAxesMap = _.keyBy(this.yAxes, 'id');
    const seriesMap = _.keyBy(this.series, 'id');
    const seriesGroupsMap = _.keyBy(this.seriesGroups, 'id');

    const seriesIdsWithoutGroup = [];
    const seriesGroupIdToSeriesIdsMap = new Map();
    for (const singleSeries of this.series) {
      if (singleSeries.groupId) {
        if (seriesGroupIdToSeriesIdsMap.has(singleSeries.groupId)) {
          seriesGroupIdToSeriesIdsMap.get(singleSeries.groupId).push(singleSeries.id);
        } else {
          seriesGroupIdToSeriesIdsMap.set(singleSeries.groupId, [singleSeries.id]);
        }
      } else {
        seriesIdsWithoutGroup.push(singleSeries.id);
      }
    }
    const seriesGroupsForTooltip = [{
      stack: false,
      showSeriesSum: false,
      seriesIds: seriesIdsWithoutGroup,
    }, ...this.seriesGroups.map((seriesGroup) => Object.assign({}, seriesGroup, {
      seriesIds: seriesGroupIdToSeriesIdsMap.get(seriesGroup.id) || [],
    }))];
    const fallbackValueFormatter = (val) => val;

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            show: false,
          },
        },
        confine: true,
        formatter: (paramsArray) => {
          if (!Array.isArray(paramsArray) || paramsArray.length === 0) {
            return null;
          }
          const seriesIdToParamMap = _.keyBy(paramsArray, 'seriesId');

          const timestamp = Number.parseInt(paramsArray[0].value[0]);
          const formattedTimestamp = this.xAxis.timestampFormatter(timestamp);
          const headerHtml =
            `<div class="tooltip-header">${_.escape(formattedTimestamp)}</div>`;

          const seriesGroupsHtml = seriesGroupsForTooltip.map((seriesGroup) => {
            const involvedSeriesIds = seriesGroup.seriesIds
              .filter((seriesId) => seriesId in seriesIdToParamMap);
            if (!involvedSeriesIds.length) {
              return '';
            }
            let seriesGroupSum = 0;
            const usedValueFormatters = new Set();
            const seriesHtml = seriesGroup.seriesIds.map((seriesId) => {
              const {
                seriesName,
                value: [, yValue],
                marker,
              } = seriesIdToParamMap[seriesId];
              seriesGroupSum += yValue;
              const series = seriesMap[seriesId];
              const yAxis = series && yAxesMap[series.yAxisId];
              const valueFormatter = yAxis ? yAxis.valueFormatter : fallbackValueFormatter;
              usedValueFormatters.add(valueFormatter);
              return `<div class="tooltip-series"><span class="tooltip-series-label">${marker} ${_.escape(seriesName)}</span> <span class="tooltip-series-value">${_.escape(valueFormatter(yValue))}</span></div>`;
            }).join('');
            let groupHeaderHtml = '<hr class="tooltip-series-separator" />';
            if (seriesGroup.name) {
              let sumHtml = '';
              if (seriesGroup.showSeriesSum && usedValueFormatters.size === 1) {
                const sumValueFormatter = [...usedValueFormatters][0];
                sumHtml =
                  `<span class="tooltip-series-value">${_.escape(sumValueFormatter(seriesGroupSum))}</span>`;
              }
              groupHeaderHtml +=
                `<div class="tooltip-series tooltip-group-header"><span class="tooltip-series-label">${_.escape(seriesGroup.name)}</span> ${sumHtml}</div>`;
            }
            return `${groupHeaderHtml}${seriesHtml}`;
          }).join('');

          return `${headerHtml}${seriesGroupsHtml}`;
        },
      },
      grid: {
        containLabel: true,
        left: 10,
        bottom: 10,
        top: 30,
        right: 30,
      },
      yAxis: this.yAxes.map((yAxis) => ({
        type: 'value',
        name: yAxis.name,
        minInterval: yAxis.minInterval,
        min: ({ min }) => Number.isNaN(min) ? 0 : null,
        max: ({ max }) => Number.isNaN(max) ? 0 : null,
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
      series: this.series.map((series) => {
        const seriesGroup = seriesGroupsMap[series.groupId];
        const stackId = seriesGroup && seriesGroup.stack ? seriesGroup.id : null;
        return {
          id: series.id,
          name: series.name,
          type: series.type,
          yAxisIndex: yAxisIdToIdxMap[series.yAxisId],
          color: series.color,
          stack: stackId,
          areaStyle: stackId ? {} : null,
          smooth: 0.2,
          data: series.data.map(({ timestamp, value }) => [String(timestamp), value]),
        };
      }),
    };
  }
}
