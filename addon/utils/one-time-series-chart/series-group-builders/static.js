/**
 * Builder function responsible for generating series groups from `static`
 * raw builder configuration.
 *
 * `static` builder just returns a single series group generated directly from
 * `builderRecipe.seriesGroupTemplate`.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCStaticSeriesGroupBuilderArguments
 * @property {OTSCRawSeries} seriesGroupTemplate
 */

import { all as allFulfilled } from 'rsvp';

/**
 * @param {OTSCSeriesGroupBuilderContext} context
 * @param {OTSCStaticSeriesGroupBuilderArguments} args
 * @returns {Promise<OTSCSeriesGroup[]>}
 */
export default async function staticBuilder(context, args) {
  if (!args || !args.seriesGroupTemplate) {
    return [];
  }

  return allFulfilled([context.evaluateSeriesGroup(context, args.seriesGroupTemplate)]);
}
