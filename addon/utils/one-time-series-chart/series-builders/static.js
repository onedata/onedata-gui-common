/**
 * Builder function responsible for generating series from `static`
 * raw builder configuration.
 *
 * `static` builder just returns a single series generated directly from
 * `builderRecipe.seriesTemplate`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCStaticSeriesBuilderArguments
 * @property {OTSCRawSeries} seriesTemplate
 */

/**
 * @param {OTSCSeriesBuilderContext} context
 * @param {OTSCStaticSeriesBuilderArguments} args
 * @returns {Promise<OTSCSeries[]>}
 */
export default async function staticBuilder(context, args) {
  if (!args || !args.seriesTemplate) {
    return [];
  }

  return [await context.evaluateSeries(context, args.seriesTemplate)];
}
