/**
 * @typedef {Object} OneHistogramStaticSeriesFactoryArguments
 * @property {OneHistogramRawSeries} seriesTemplate
 */

/**
 * @param {OneHistogramSeriesFactoryContext} context
 * @param {OneHistogramStaticSeriesFactoryArguments} args
 * @returns {Promise<OneHistogramSeries[]>}
 */
export default async function staticFactory(context, args) {
  if (!args || !args.seriesTemplate) {
    return [];
  }

  return await context.evaluateSeries(context, args.seriesTemplate);
}
