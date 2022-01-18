/**
 * @typedef {Object} OneHistogramGetDSCDataSeriesFunctionArguments
 * @property {string} [propertyName]
 */

/**
 * @param {OneHistogramSeriesFunctionContext} context
 * @param {OneHistogramGetDSCDataSeriesFunctionArguments} args
 * @returns {Promise<unknown>}
 */
export default async function getDynamicSeriesConfigData(context, args) {
  let data = null;
  if ('dynamicSeriesConfig' in context) {
    const config = context.dynamicSeriesConfig;
    if (!args || !args.propertyName) {
      data = config;
    } else {
      if (typeof config === 'object' && config && args.propertyName in config) {
        data = config[args.propertyName];
      } else {
        data = null;
      }
    }
  }

  return {
    type: 'basic',
    data,
  };
}
