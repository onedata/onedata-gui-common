/**
 * @typedef {Object} OneHistogramStateInitOptions
 * @property {string} title
 * @property {OneHistogramYAxis[]} yAxes
 * @property {OneHistogramXAxis} xAxis
 * @property {OneHistogramSeries[]} series
 * @property {number} timeResolution
 * @property {number} windowsCount
 * @property {number} newestWindowTimestamp
 */

/**
 * @typedef {Object} OneHistogramYAxis
 * @property {string} id
 * @property {string} name
 * @property {OneHistogramFormatter} valueFormatter
 */

/**
 * @typedef {Object} OneHistogramFormatter
 * @property {(value: unknown, functionArguments: Object) => string} function
 * @property {Object} functionArguments
 */

/**
 * @typedef {Object} OneHistogramXAxis
 * @property {string} name
 * @property {number[]} timestamps
 * @property {(timestamp: number) => string} timestampFormatter
 */

/**
 * @typedef {Object} OneHistogramSeries
 * @property {string} name
 * @property {OneHistogramChartType} type
 * @property {string} yAxisId
 * @property {string|undefined} stackId
 * @property {OneHistogramSeriesPoint[]} data
 */

/**
 * @typedef {Object} OneHistogramSeriesPoint
 * @property {number} timestamp
 * @property {number} value
 * @property {boolean} oldest
 * @property {boolean} newest
 * @property {boolean} fake
 */

export default class OneHistogramState {
  /**
   * @public
   * @param {OneHistogramStateInitOptions} options
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
     * @type {OneHistogramYAxis[]}
     */
    this.yAxes = options.yAxes;

    /**
     * @public
     * @readonly
     * @type {OneHistogramXAxis}
     */
    this.xAxis = options.xAxis;

    /**
     * @public
     * @readonly
     * @type {OneHistogramSeries[]}
     */
    this.series = options.series;

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
     * @type {number}
     */
    this.firstWindowTimestamp = (this.series[0].data[0] || {}).timestamp;

    /**
     * @public
     * @readonly
     * @type {number}
     */
    this.lastWindowTimestamp = (this.series[0].data[this.series[0].data.length - 1] || {}).timestamp;

    /**
     * @public
     * @readonly
     * @type {boolean}
     */
    this.hasReachedOldest = this.series.every((series) =>
      series.data.length && series.data[0].oldest
    );

    /**
     * @public
     * @readonly
     * @type {boolean}
     */
    this.hasReachedNewest = this.series.every((series) =>
      series.data.length && series.data[series.data.length - 1].newest
    );
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
            return;
          }
          const timestamp = Number.parseInt(paramsArray[0].axisValue);
          const formattedTimestamp = this.xAxis.timestampFormatter(timestamp);
          const headerHtml =
            `<div class="tooltip-header">${formattedTimestamp}</div>`;
          const seriesHtml = paramsArray.map(({
            seriesId,
            seriesName,
            value: [, yValue],
            marker,
          }) => {
            const series = this.series.findBy('id', seriesId);
            const yAxis = series && this.yAxes.findBy('id', series.yAxisId);
            const valueFormatter = yAxis ? yAxis.valueFormatter : (val) => val;
            return `<div class="tooltip-series"><span class="tooltip-series-label">${marker} ${seriesName}</span> <span class="tooltip-series-value">${valueFormatter(yValue)}</span></div>`;
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
