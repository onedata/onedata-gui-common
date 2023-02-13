/**
 * A special series function, which returns data provided in `data` argument.
 * Type of `data` does not matter.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

/**
 * @typedef {OTSCLiteralSeriesFunctionBasicData|OTSCLiteralSeriesFunctionPointsData} OTSCLiteralSeriesFunctionArguments
 */

/**
 * @typedef {Object} OTSCLiteralSeriesFunctionPointsData
 * @property {'points'} type
 * @property {Array<Utils.OneTimeSeriesChart.Point>} data
 */

/**
 * @typedef {Object} OTSCLiteralSeriesFunctionBasicData
 * @property {'basic'} [type]
 * @property {unknown} data
 */

/**
 * @param {OTSCSeriesFunctionContext} context
 * @param {OTSCLiteralSeriesFunctionArguments} args
 * @returns {OTSCSeriesFunctionGenericResult<unknown>}
 */
export default function literal(context, args) {
  const type = args?.type === 'points' ? 'points' : 'basic';
  const data = (args && 'data' in args) ? args.data : null;
  return {
    type,
    data,
  };
}
