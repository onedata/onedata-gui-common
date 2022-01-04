/**
 * @typedef {Object} OneHistogramStateInitOptions
 * @property {string} id
 * @property {string} title
 * @property {OneHistogramYAxisConfiguration[]} yAxes
 * @property {OneHistogramXAxisConfiguration} xAxis
 */

/**
 * @typedef {Object} OneHistogramYAxisConfiguration
 * @property {string} id
 * @property {string} name
 * @property {OneHistogramFormatterConfiguration} valueFormatter
 */

/**
 * @typedef {Object} OneHistogramFormatterConfiguration
 * @property {(value: unknown, functionArguments: Object) => string} function
 * @property {Object} functionArguments
 */

/**
 * @typedef {Object} OneHistogramXAxisConfiguration
 * @property {string} name
 * @property {number[]} timestamps
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
    this.id = options.id;

    /**
     * @public
     * @readonly
     * @type {string}
     */
    this.title = options.title;

    /**
     * @public
     * @readonly
     * @type {OneHistogramYAxisConfiguration[]}
     */
    this.yAxes = options.yAxes;

    /**
     * @public
     * @readonly
     * @type {OneHistogramXAxisConfiguration}
     */
    this.xAxis = options.xAxis;
  }

  /**
   * @public
   * @returns {ECOption}
   */
  asEchartState() {
    return {
      yAxis: this.yAxes.map((yAxis) => ({
        type: 'value',
        name: yAxis.name,
        axisLine: {
          show: true,
        },
        axisLabel: {
          formatter: (value) => yAxis.valueFormatter.function(
            value,
            yAxis.valueFormatter.functionArguments
          ),
        },
      })),
      xAxis: {
        type: 'category',
        data: this.xAxis.timestamps,
      },
    };
  }
}
