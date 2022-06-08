/**
 * Factory function responsible for generating series groups from `static`
 * raw factory configuration.
 *
 * `static` factory just returns a single series group generated directly from
 * `factoryArguments.seriesGroupTemplate`.
 *
 * @module utils/one-time-series-chart/series-group-factories/static
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {Object} OTSCStaticSeriesGroupFactoryArguments
 * @property {OTSCRawSeries} seriesGroupTemplate
 */

import { all as allFulfilled } from 'rsvp';

/**
 * @param {OTSCSeriesGroupFactoryContext} context
 * @param {OTSCStaticSeriesGroupFactoryArguments} args
 * @returns {Promise<OTSCSeriesGroup[]>}
 */
export default async function staticFactory(context, args) {
  if (!args || !args.seriesGroupTemplate) {
    return [];
  }

  return allFulfilled([context.evaluateSeriesGroup(context, args.seriesGroupTemplate)]);
}
