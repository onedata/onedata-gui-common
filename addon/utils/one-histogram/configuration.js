import OneHistogramState from './state';
import valueFormattersIndex from './value-formatters';

/**
 * @typedef {Object} OneHistogramConfigurationInitOptions
 * @property {OneHistogramRawConfiguration} rawConfiguration
 * @property {OneHistogramDataSources} dataSources
 */

/**
 * @typedef {Object} OneHistogramRawConfiguration
 * @property {string} id
 * @property {string} title
 * @property {OneHistogramYAxisRawConfiguration[]} yAxes
 */

/**
 * @typedef {Object} OneHistogramYAxisRawConfiguration
 * @property {string} id
 * @property {string} name
 * @property {OneHistogramFormatterRawConfiguration} valueFormatter
 */

/**
 * @typedef {Object} OneHistogramFormatterRawConfiguration
 * @property {string} functionName
 * @property {Object} functionArguments
 */

/**
 * @typedef {Object<string,OneHistogramDataSource>} OneHistogramDataSources
 */

/**
 * @typedef {Object} OneHistogramDataSource
 * @property {(options: OneHistogramDataSourceFetchOptions) => Promise<unknown[]>} fetchData
 * @property {OneHistogramReloadTimePerWindow} [reloadTime]
 */

/**
 * @typedef {Object} OneHistogramReloadTimePerWindow
 * @property {number} second
 * @property {number} minute
 * @property {number} hour
 * @property {number} day
 */

/**
 * @typedef {(configuration: OneHistogramConfiguration) => void} StateChangeHandler
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
     * @type {OneHistogramDataSources}
     */
    this.dataSources = options.dataSources;

    /**
     * @private
     * @type {Set<StateChangeHandler>}
     */
    this.stateChangeHandlers = new Set();
  }

  /**
   * @public
   * @param {StateChangeHandler} handler
   * @returns {void}
   */
  registerStateChangeHandler(handler) {
    this.stateChangeHandlers.add(handler);
  }

  /**
   * @public
   * @param {StateChangeHandler} handler
   * @returns {void}
   */
  deregisterStateChangeHandler(handler) {
    this.stateChangeHandlers.delete(handler);
  }

  /**
   * @public
   * @returns {Promise<OneHistogramState>}
   */
  async getNewestState() {
    return new OneHistogramState({
      id: this.rawConfiguration.id,
      title: this.rawConfiguration.title,
      yAxes: this.getYAxesState(),
      xAxis: this.getXAxisState(),
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
  getXAxisState() {
    return {
      name: 'Time',
      timestamps: [123, 456],
    };
  }

  /**
   * @private
   * @param {StateChangeHandler} handler
   * @returns {void}
   */
  notifyStateChange() {
    this.stateChangeHandlers.forEach(callback => callback(this));
  }
}
