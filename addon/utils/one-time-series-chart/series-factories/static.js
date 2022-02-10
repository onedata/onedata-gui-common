/**
 * Factory function responsible for generating series from `static`
 * raw factory configuration.
 *
 * `static` factory just returns a single series generated directly from
 * `factoryArguments.seriesTemplate`.
 *
 * @module utils/one-time-series-chart/series-factories/static
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCStaticSeriesFactoryArguments
 * @property {OTSCRawSeries} seriesTemplate
 */

/**
 * @param {OTSCSeriesFactoryContext} context
 * @param {OTSCStaticSeriesFactoryArguments} args
 * @returns {Promise<OTSCSeries[]>}
 */
export default async function staticFactory(context, args) {
  if (!args || !args.seriesTemplate) {
    return [];
  }

  return [await context.evaluateSeries(context, args.seriesTemplate)];
}
